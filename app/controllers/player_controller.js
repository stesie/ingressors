var locomotive = require('locomotive')
  , filters = require('../../lib/filters')
  , Controller = locomotive.Controller
  , Player = require('../models/player');

var PagesController = new Controller();

PagesController.before('nickname', filters.isAuth);
PagesController.nickname = function() {
  var err = null, that = this;

  if(this.req.user.nickName) {
    err = 'Nickname already set';
  }

  if(this.req.body.nickname === '') {
    err = 'Nickname cannot be empty';
  }

  if(err !== null) {
    this.req.flash('error', err);
    this.redirect('/');
    return;
  }

  this.req.user.nickName = this.req.body.nickname;
  this.req.user.save(function(err) {
    if(err) {
      that.req.flash('error', 'Unable to store nickname');
    } else {
      that.req.flash('info', 'Nickname update accepted');
    }
    that.redirect('/');
  });
};


PagesController.before('nicksearch', filters.isAuth);
PagesController.nicksearch = function() {
  var err = null, that = this;

  if(typeof this.req.query.q !== 'string') {
    return this.res.send(400, { error: 'Query parameter q not provided' });
  }

  var escapeChars = '+-&|!(){}[]^"~*?:\\';
  var query = "nickname:" + this.req.query.q.split('').map(function(e) {
    return escapeChars.indexOf(e) === -1 ? e : '\\'+e;
  }).concat('*').join('').toLowerCase()

  Player.search(query, function(err, results) {
    if(err) { return that.res.send(500, { error: 'Query failed' }); }

    that.res.setHeader('Content-Type', 'application/json');
    that.res.send(200, JSON.stringify(results.map(function(player) {
      return player.nickName;
    })));
  });
};


PagesController.before('poke', filters.isAuth);
PagesController.poke = function() {
  var err = null, that = this;

  if(this.req.body.nickname === '') {
    this.req.flash('error', 'Nickname cannot be empty');
    this.redirect('/');
    return;
  }

  Player.findByNickName(this.req.body.nickname, function(err, toPoke) {
    if(err) {
      that.req.flash('error', 'No agent known with that nickname');
      that.redirect('/');
      return;
    }

    if(that.req.user.id === toPoke.id) {
      that.req.flash('error', 'It doesn\'t make much sense to poke yourself!');
      that.redirect('/');
      return;
    }

    that.req.user.poke(toPoke, function(err) {
      if(err) {
	that.req.flash('error', 'Unable to store poke request');
      } else {
	that.req.flash('info', 'Player poked successfully');
      }
      that.redirect('/');
    });
  });
};


PagesController.before('pokereply', filters.isAuth);
PagesController.pokereply = function() {
  var err = null, that = this;

  if(this.req.body.accept !== undefined && this.req.body.reject !== undefined) {
    this.req.flash('error', 'Cannot simultaneosly accept and reject a request');
    this.redirect('/');
    return;
  }

  var mode = (this.req.body.accept !== undefined) ? 'accept' : 'reject';
  var nickname = this.req.body[mode];

  Player.findByNickName(nickname, function(err, poker) {
    if(err) {
      that.req.flash('error', 'No agent known with that nickname');
      that.redirect('/');
      return;
    }

    if(that.req.user.id === poker.id) {
      that.req.flash('error', 'You cannot reply to yourself!');
      that.redirect('/');
      return;
    }

    if(mode === 'accept') {
      that.req.user.trust(poker, function(err) {
	if(err) {
	  that.req.flash('error', 'Unable to store poke reply');
	  that.redirect('/');
	} else {
	  poker.delPoke(that.req.user, function(err) {
	    if(err) {
	      that.req.flash('error', 'Unable to remove poke request');
	    } else {
	      that.req.flash('info', 'Player trusted successfully');
	    }
	    that.redirect('/');
	  });
	}
      });
    } else {
      that.req.user.rejectPoke(poker, function(err) {
	if(err) {
	  that.req.flash('error', 'Unable to reject poke');
	} else {
	  that.req.flash('info', 'Poke rejected successfully');
	}

	that.redirect('/');
      });
    }
  });
};



module.exports = PagesController;
