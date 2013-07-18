var messages = require('./messages');

module.exports.dynamic = {
  user: function(req, res) {
    return req.user || false;
  },

  csrf: function(req, res) {
    return req.session._csrf;
  },

  messages: messages
};
