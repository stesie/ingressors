// Draw routes.  Locomotive's router provides expressive syntax for drawing
// routes, including support for resourceful routes, namespaces, and nesting.
// MVC routes can be mapped mapped to controllers using convenient
// `controller#action` shorthand.  Standard middleware in the form of
// `function(req, res, next)` is also fully supported.  Consult the Locomotive
// Guide on [routing](http://locomotivejs.org/guide/routing.html) for additional
// information.
module.exports = function routes() {
  var passport = require('passport');

  this.root('pages#main');

  this.match('/welcome', 'pages#welcome');

  this.match('/player/nickname', 'player#nickname', { via: 'POST' });
  this.match('/player/nicksearch', 'player#nicksearch');
  this.match('/player/poke', 'player#poke', { via: 'POST' });
  this.match('/player/pokereply', 'player#pokereply', { via: 'POST' });
  this.match('/player/trusts', 'player#trusts');
  this.match('/player/trusts/revoke', 'player#revoketrust', { via: 'POST' });
  this.match('/player/trusted', 'player#trusted');
  this.match('/player/trust', 'player#trust', { via: 'POST' });
  this.match('/player/weboftrust', 'player#weboftrust');

  this.match('/auth/google',
	     passport.authenticate('google', {
	       scope: [ 'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email' ]}));

  this.match('/auth/google/callback', 
	     passport.authenticate('google', { failureRedirect: '/login' }),
	     function(req, res) {
	       // Successful authentication, redirect home.
	       res.redirect('/');
	     });
}
