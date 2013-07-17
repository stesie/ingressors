var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var PagesController = new Controller();

PagesController.main = function() {
  if(!this.req.user) {
    return this.redirect('/welcome');
  }

  this.title = 'Welcome back, ingressor!';
  this.render();
}

PagesController.welcome = function() {
  this.title = 'Welcome stranger';
  this.render();
}

module.exports = PagesController;
