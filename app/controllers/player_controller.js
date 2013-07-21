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
  _playerAction.call(this, this.req.body.nickname, 'poke', {
    failedMessage: 'Unable to store poke request',
    successMessage: 'Player poked successfully'
  });
};


PagesController.before('pokereply', filters.isAuth);
PagesController.pokereply = function() {
  var err = null, that = this, method, nickname;

  if(this.req.body.accept !== undefined && this.req.body.reject !== undefined) {
    this.req.flash('error', 'Cannot simultaneosly accept and reject a request');
    this.redirect('/');
    return;
  }

  if(this.req.body.accept !== undefined) {
    _playerAction.call(this, this.req.body.accept, 'trust', {
      failedMessage: 'Unable to store poke reply',
      successMessage: 'Player trusted successfully'
    });
  } else {
    _playerAction.call(this, this.req.body.reject, 'rejectPoke', {
      failedMessage: 'Unable to reject poke',
      successMessage: 'Poke rejected successfully'
    });
  }
};


function _playerAction(nickname, method, config) {
  var err = null, that = this;

  if(nickname === '') {
    this.req.flash('error', 'Nickname cannot be empty');
    this.redirect(this.req.body.backurl || config.defaultBackUrl || '/');
    return;
  }

  Player.findByNickName(nickname, function(err, target) {
    if(err) {
      console.log(err);
      that.req.flash('error', 'No agent known with that nickname');
      that.redirect(that.req.body.backurl || config.defaultBackUrl || '/');
      return;
    }

    if(that.req.user.id === target.id) {
      that.req.flash('error', 'It does not make much sense to just play with yourself!');
      that.redirect(that.req.body.backurl || config.defaultBackUrl || '/');
      return;
    }


    that.req.user[method](target, function(err) {
      if(err) {
	console.log(err);
	that.req.flash('error', config.failedMessage);
      } else {
	that.req.flash('info', config.successMessage);
      }

      that.redirect(that.req.body.backurl || config.defaultBackUrl || '/');
    });
  });
}


PagesController.before('trust', filters.isAuth);
PagesController.trust = function() {
  _playerAction.call(this, this.req.body.nickname, 'trust', {
    successMessage: 'Player trusted successfully',
    failedMessage: 'Unable to store trust record',
  });
};


PagesController.before('revoketrust', filters.isAuth);
PagesController.revoketrust = function() {
  _playerAction.call(this, this.req.body.revoke, 'delTrust', {
    defaultBackUrl: '/player/trusts',
    successMessage: 'Trust successfully revoked',
    failedMessage: 'Unable to revoke trust',
  });
};


////////////////////////////////////////////////////////////////////////////////////////////////////


PagesController.before('trusts', filters.isAuth);
PagesController.trusts = function() {
  var that = this;
  this.req.user.getOutgoingTrusts(function(err, trusts) {
    if(err) {
      console.log(err);
      that.req.flash('error', 'An error occurred while looking up trust information.');
    }

    that.title = 'Trusted players';
    that.trusts = trusts;
    that.render();
  });
};


PagesController.before('trusted', filters.isAuth);
PagesController.trusted = function() {
  var that = this;
  this.req.user.getIncomingTrusts(function(err, trusts) {
    if(err) {
      console.log(err);
      that.req.flash('error', 'An error occurred while looking up trust information.');
    }

    that.title = 'Trusting players';
    that.trusts = trusts;
    that.render();
  });
};


PagesController.before('weboftrust', filters.isAuth);
PagesController.weboftrust = function() {
  var that = this;
  this.req.user.getWebOfTrust(function(err, trusts) {
    if(err) {
      console.log(err);
      that.req.flash('error', 'An error occurred while looking up trust information.');
    }

    that.title = 'Trusted players';
    that.trusts = trusts;
    that.render();
  });
};


module.exports = PagesController;
