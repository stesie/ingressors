module.exports.dynamic = {
  user: function(req, res) {
    return req.user || false;
  }
};
