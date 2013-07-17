module.exports.isAuth = function(next) {
  if(!this.req.isAuthenticated()) {
    return this.redirect('/auth/google');
  }

  next();
};
