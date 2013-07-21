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

Object.defineProperty(Player.prototype, 'nickName', {
  get: function() { return this._node.data.nickName; },
  set: function(nickName) { this._node.data.nickName = nickName; }
});

Object.defineProperty(Player.prototype, 'pictureUrl', {
  get: function() { return this._node.data.pictureUrl; },
  set: function(pictureUrl) { this._node.data.pictureUrl = pictureUrl; }
});


// public instance methods
Player.prototype.save = function(callback) {
  var that = this;
  this._node.save(function(err) {
    if(err || that.nickName === undefined) { return callback(err); }

    that._node.index('players', 'nickname', that.nickName.toLowerCase(), function(err) {
      callback(err);
    });
  });
};

Player.prototype.del = function(callback) {
  this._node.del(function(err) {
    callback(err);
  });
};

Player.prototype._addRelationship = function(target, type, data, callback) {
  var that = this;
  this._node.path(target._node, type, 'out', 1, 'shortestPath', function(err, path) {
    if(err) { return callback(err, null); }
    if(path && path.length !== 0) { return callback(new Error('relationship exists already'), null); }

    return that._node.createRelationshipTo(target._node, type, data, function(err) {
      callback(err);
    });
  });
}

Player.prototype.poke = function(toPoke, callback) {
  return this._addRelationship(toPoke, 'pokes', { }, callback);
};

Player.prototype.trust = function(toTrust, callback) {
  return this._addRelationship(toTrust, 'trusts', { }, callback);
};

Player.prototype.delPoke = function(poker, callback) {
  this._node.path(poker._node, "pokes", "all", 1, "shortestPath", function(err, path) {
    if(err || path.length !== 1) { return callback(err); }
    return path.relationships[0].del(callback);
  });
};

Player.prototype.delTrust = function(trusted, callback) {
  this._node.path(trusted._node, "trusts", "all", 1, "shortestPath", function(err, path) {
    if(err || path.length !== 1) { return callback(err); }
    return path.relationships[0].del(callback);
  });
};

Player.prototype.rejectPoke = function(poker, callback) {
  return this._updatePoke(poker, { rejected: 1 }, callback);
};

Player.prototype._updatePoke = function(poker, data, callback) {
  this._node.path(poker._node, "pokes", "all", 1, "shortestPath", function(err, path) {
    if(err || path.length !== 1) { return callback(err); }

    var rel = path.relationships[0];
    rel.data = rel.data || {};

    for(var key in data) {
      if(data.hasOwnProperty(key)) {
	rel.data[key] = data[key];
      }
    }

    rel.save(function(err) {
      callback(err);
    });
  });
}

Player.prototype._runCypherQuery = function(query, params, callback) {
  params.player  = params.player || this.id;

  db.query(query, params,
	   function(err, result) {
	     if(err || result.length === 0) { return callback(err, result); }

	     return callback(null, result.map(function(row) {
	       var player = new Player(row.b);
	       player.num_trusts = row.num_trusts;
	       return player;
	     }));
	   });
};

Player.prototype.getIncomingPokes = function(callback) {
  return this._runCypherQuery(
    "START a = node({player}) MATCH b-[m :pokes]->a WHERE m.rejected? = 0 RETURN b;",
    { },
    callback
  );
};

Player.prototype.getIncomingTrusts = function(callback) {
  return this._runCypherQuery(
    "START a = node({player}) MATCH b-[:trusts]->a RETURN b;",
    { },
    callback
  );
};

Player.prototype.getWebOfTrust = function(callback) {
  return this._runCypherQuery(
    'START a = node({player}) \
     MATCH p = a-[:trusts*]->b \
     WITH b, last(rels(p)) AS last_rel, count(*) AS t \
     RETURN b, count(*) AS num_trusts;',
    { },
    callback
  );
};

Player.prototype.getOutgoingTrusts = function(callback) {
  return this._runCypherQuery(
    "START a = node({player}) MATCH a-[:trusts]->b RETURN b;",
    { },
    callback
  );
};


// public static methods
Player.findByProfileId = function(profileId, callback) {
  db.getIndexedNode("players", "id", profileId, function(err, res) {
    if(err || res === null) {
      if(err && err.message.indexOf('Neo4j NotFoundException') === 0) {
	// don't propagate NotFoundException from Neo4j, which is probably
	// due to a not yet existing index
	err = null;
      }

      return callback(err, null);
    }

    callback(null, new Player(res));
  });
};

Player.findByNickName = function(nickName, callback) {
  db.getIndexedNode('players', 'nickname', nickName.toLowerCase(), function(err, res) {
    if(err || res === null) { return callback(err, null); }
    callback(null, new Player(res));
  });
};


Player.search = function(query, callback) {
  db.queryNodeIndex('players', query, function(err, result) {
    if(err || result.length === 0) { return callback(err, result); }

    callback(null, result.map(function(node) {
      return new Player(node);
    }));
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

