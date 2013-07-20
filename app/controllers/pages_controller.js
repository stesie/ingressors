var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var PagesController = new Controller();

PagesController.main = function() {
  if(!this.req.user) {
    return this.redirect('/welcome');
  }

  this.title = 'Welcome back, ingressor!';

  var that = this;
  this.req.user.getIncomingPokes(function(err, pokes) {
    if(err) {
      console.log(err);
      that.req.flash('error', 'An error occurred while looking up incoming pokes.');
    }

    that.pokes = pokes;
    that.render();
  });
}

PagesController.welcome = function() {
  this.title = 'Welcome stranger';
  this.render();
}

module.exports = PagesController;
