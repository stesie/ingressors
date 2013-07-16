module.exports = function() {
  var passport = require('passport');
  var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  var Player = require('../../app/models/player');

  passport.use(new GoogleStrategy({
    clientID: '407988379787-o384bt0su735euksjo5tgs6jrfmd5397.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
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
