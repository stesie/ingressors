var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var PagesController = new Controller();

PagesController.main = function() {
  console.log(this.req.user ? this.req.user.displayName : 'not logged in');
  this.title = 'Locomotive Fnord'
  this.render();
}

module.exports = PagesController;
