module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx");
  var util = require("util");
  var request = require("superagent");
  var Query = require("./query");
  var Command = require("./command");
  
  /**
   * @param  {} usr
   * @param  {} pwd
   * @param  {} cb
   */
  var authenticate = function(usr,pwd,cb) {
    var credentials;    
    if (typeof pwd === "function") {
      cb = pwd;
      credentials = usr;
    } else {
      credentials = usr + ":" + pwd;
    }
    cb = cb || function() {};
    var self = this;
    var options = {
      uri: util.format("%s/token", this._config.commandHost || this._config.queryHost),
      headers: { "Authorization": "Basic " + credentials },
      json: true,
      body: { grant_type: "client_credentials", ttl: self._config.accessTokenTTL || 3600 }
    };

    request.post(options.uri).set(options.headers).send(options.body).end(function(err, res) {
      if (err) {
        return cb(err);
      }
      if (res.ok) {
        self._accessToken = res.body.access_token;
        cb(null, res.body.access_token);
      } else {
        cb(new Error(res.body ? res.body.error_description : "unknown error")); 
      }
    });
  };

  function API(config) {
    if (config.baseCommandURL) {
      log("baseCommandURL is deprecated - use commandHost");
      config.commandHost = config.baseCommandURL;
    }
    if (config.baseQueryURL) {
      log("baseQueryURL is deprecated - use queryHost");
      config.queryHost = config.baseQueryURL;
    }
    this._config = config;
    this._accessToken = config.accessToken || "";
    this.authenticate = authenticate;

    // Add query methods to API
    Query.call(this, config);

    // Add command methods to API
    Command.call(this, config);
  }

  return API;
}());