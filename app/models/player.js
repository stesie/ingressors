var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474/');


var Player = module.exports = function Player(_node) {
  this._node = _node;
};


// public instance properties
Object.defineProperty(Player.prototype, 'id', {
  get: function() { return this._node.id; }
});

Object.defineProperty(Player.prototype, 'exists', {
  get: function() { return this._node.exists; }
});

Object.defineProperty(Player.prototype, 'profileId', {
  get: function() { return this._node.data.profileId; },
  set: function(profileId) { this._node.data.profileId = profileId; }
});

Object.defineProperty(Player.prototype, 'profileUrl', {
  get: function() { return this._node.data.profileUrl; },
  set: function(profileUrl) { this._node.data.profileUrl = profileUrl; }
});

Object.defineProperty(Player.prototype, 'email', {
  get: function() { return this._node.data.email; },
  set: function(email) { this._node.data.email = email; }
});

Object.defineProperty(Player.prototype, 'displayName', {
  get: function() { return this._node.data.displayName; },
  set: function(displayName) { this._node.data.displayName = displayName; }
});

Object.defineProperty(Player.prototype, 'pictureUrl', {
  get: function() { return this._node.data.pictureUrl; },
  set: function(pictureUrl) { this._node.data.pictureUrl = pictureUrl; }
});


// public instance methods
Player.prototype.save = function(callback) {
  this._node.save(function(err) {
    callback(err);
  });
};

Player.prototype.del = function(callback) {
  this._node.del(function(err) {
    callback(err);
  });
};


// public static methods
Player.findByProfileId = function(profileId, callback) {
  db.getIndexedNode("players", "id", profileId, function(err, res) {
    if(err || res === null) {
      return callback(err, null);
    }

    callback(null, new Player(res));
  });
};

Player.create = function(data, callback) {
  var node = db.createNode(data);
  var player = new Player(node);

  node.save(function(err) {
    if(err) return callback(err);

    node.index("players", "id", data.profileId, function(err) {
      if(err) return callback(err);
      callback(null, player);
    });
  });
};

Player.authenticate = function(profile, callback) {
  Player.findByProfileId(profile.id, function(err, player) {
    if(err || player) return callback(err, player);

    // player doesn't exist yet, create
    Player.create({
      profileId: profile.id,
      displayName: profile._json.name,
      email: profile._json.email,
      profileUrl: profile._json.link,
      pictureUrl: profile._json.picture
    }, callback);
  });
};

