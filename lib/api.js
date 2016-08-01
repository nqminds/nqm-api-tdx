module.exports = (function() {
  "use strict";

  var util = require("util");
  var request = require("request");
  var Query = require("./query");
  var Command = require("./command");

  var authenticate = function(usr,pwd,cb) {
    var self = this;
    var options = {
      uri: util.format("%s/token", this._config.baseCommandURL || this._config.baseQueryURL),
      headers: { "Authorization": "Basic " + usr + ":" + pwd },
      json: true,
      body: { grant_type: "client_credentials", ttl: self._config.accessTokenTTL || 3600 }
    };
    request.post(options, function(err, qres, body) {
      if (err) { 
        return cb(err); 
      }
      if (qres.statusCode === 200) {
        self._accessToken = body.access_token;
        cb(null, body.access_token);
      } else {
        cb(new Error(body ? body.error_description : "unknown error")); 
      }
    });
  };

  function API(config) {
    this._config = config;
    this._accessToken = config.accessToken || "";
    this.authenticate = authenticate;
    Query.call(this, config);
    Command.call(this, config);
  }

  return API;
}());