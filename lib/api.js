module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx");
  var util = require("util");
  var request = require("superagent");
  var Query = require("./query");
  var Aggregate = require("./aggregate");
  var Command = require("./command");
  var Databot = require("./databot");
  var Distinct = require("./distinct");
  
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

    request.post(options.uri)
      .set(options.headers)
      .send(options.body)
      .end(function(err, res) {
        if (err) {
          var msg;
          if (err.response) {
            msg = util.format("authenticate failure: [%s] %s", err.response.body.error, err.response.body.error_description);
          } else {
            msg = util.format("authenticate failure: %s", err.message);
          }
          cb({name: "TDXApiError", message: msg, status: err.status, stack: err.stack });
        } else {
          self._accessToken = res.body.access_token;
          cb(null, res.body.access_token);
        } 
      });
  };

  var setDefaults = function() {
    if (this._config.tdxHost) {
      const protocolComponents = this._config.tdxHost.split("://");
      if (protocolComponents.length !== 2) {
        throw new Error("invalid tdxHost in config - no protocol: " + this._config.tdxHost);
      }
      const protocol = protocolComponents[0];
      const hostComponents = protocolComponents[1].split(".");
      if (hostComponents.length < 3) {
        throw new Error("invalid tdxHost in config - expected sub.domain.tld: " + this._config.tdxHost);
      }
      const hostname = hostComponents.slice(1).join(".");
      this._config.commandHost = util.format("%s://%s.%s", protocol, "cmd", hostname);
      this._config.queryHost   = util.format("%s://%s.%s", protocol, "q", hostname);
      this._config.databotHost = util.format("%s://%s.%s", protocol, "databot", hostname);
      log("defaulted hosts to %s, %s, %s",this._config.commandHost, this._config.queryHost, this._config.databotHost);
    }    
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

    setDefaults.call(this);

    // Add query methods to API
    Query.call(this, config);

    // Add aggregate methods to API
    Aggregate.call(this, config);

    // Add command methods to API
    Command.call(this, config);

    // Add databot methods to API
    Databot.call(this, config);

    // Add distinct methods to API
    Distinct.call(this, config);
  }

  return API;
}());