var express = require('express')
  , poweredBy = require('connect-powered-by')
  , passport = require('passport')
  , util = require('util');

module.exports = function() {
  // Warn of version mismatch between global "lcm" binary and local installation
  // of Locomotive.
  if (this.version !== require('locomotive').version) {
    console.warn(util.format('version mismatch between local (%s) and global (%s) Locomotive module', require('locomotive').version, this.version));
  }

  // Configure application settings.  Consult the Express API Reference for a
  // list of the available [settings](http://expressjs.com/api.html#app-settings).
  this.set('views', __dirname + '/../../app/views');
  this.set('view engine', 'ejs');

  // Register EJS as a template engine.
  this.engine('ejs', require('ejs').__express);

  // Use middleware.  Standard [Connect](http://www.senchalabs.org/connect/)
  // middleware is built-in, with additional [third-party](https://github.com/senchalabs/connect/wiki)
  // middleware available as separate modules.
  this.use(poweredBy('Locomotive'));
  this.use(express.logger());
  this.use(express.favicon());
  this.use(express.static(__dirname + '/../../public'));
  this.use(express.bodyParser());
  this.use(express.methodOverride());

  this.use(express.cookieParser());
  this.use(express.session({
    secret: 'asdhwhutahutkhx}*)hdncfx3gx',
  }));

  this.use(passport.initialize());
  this.use(passport.session());

  this.use(require('connect-flash')());

  this.use(require('express-ejs-layouts'));
  this.dynamicHelpers(require('../../lib/helpers').dynamic);

  this.use(express.csrf()); /*(function(req) {
    if(!req.session.csrf_token) {
      req.session.csrf_token = crypto.randomBytes(Math.ceil(24 * 3 / 4))
        .toString('base64').slice(0, 24);
    }
    return req.session.csrf_token;
  }));*/

  this.use(this.router);
}
