var messages = require('./messages');

module.exports.dynamic = {
  user: function(req, res) {
    return req.user || false;
  },

  route: function (req, res) {
    // Generate a basic route object for use in templates
    var route = {
      // Will be the classname of the controller, not the simplified name
      controller: req._locomotive.controller,
      action: req._locomotive.action,
      route: req.route,
    }

    // Is equal to the simplified name of the controller
    route.viewDir = req._locomotive.app._controllers[route.controller].__viewDir;
    return route
  },

  csrf: function(req, res) {
    return req.session._csrf;
  },

  messages: messages
};
