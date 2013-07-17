module.exports = function() {
  var passport = require('passport');
  var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  var Player = require('../../app/models/player');

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_OAUTH_REDIRECT_URI
  }, function(accessToken, refreshToken, profile, done) {
    Player.authenticate(profile, function(err, player) {
      done(err, player);
    });
  }));


  // Passport session setup.
  passport.serializeUser(function(player, done) {
    done(null, player.profileId);
  });

  passport.deserializeUser(function(id, done) {
    Player.findByProfileId(id, function(err, user) {
      done(err, user);
    });
  });
};
