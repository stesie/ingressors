var locomotive = require('locomotive')
  , filters = require('../../lib/filters')
  , Controller = locomotive.Controller;

var PagesController = new Controller();

PagesController.before('nickname', filters.isAuth);
PagesController.nickname = function() {
  var req = this.req, res = this.res;
  if(req.user.nickName) {
    return res.send(400, { error: 'Nickname already set' });
  }

  if(req.body.nickname === '') {
    return res.send(400, { error: 'Nickname cannot be empty' });
  }

  req.user.nickName = req.body.nickname;
  req.user.save(function(err) {
    if(err) {
      res.send(500, { error: 'Unable to store nickname' });
    } else {
      res.send(204, { error: 'Nickname accepted' });
    }
  });
};

module.exports = PagesController;
