module.exports = (function() {
  "use strict";
  var request = require("request");
  var util = require("util");

  var query = function(method, filter, projection, options, accessToken, cb) {
    if (typeof accessToken === "function") {
      cb = accessToken;
      accessToken = this._accessToken;
    }
    filter = filter ? JSON.stringify(filter) : "";
    projection = projection ? JSON.stringify(projection) : "";
    options = options ? JSON.stringify(options) : "";
    var queryURL = util.format("%s/%s/%s?filter=%s&proj=%s&opts=%s", this._config.queryHost, this._version, method, filter, projection, options);
    var requestOptions = {
      json: true
    };
    if (accessToken) {
      requestOptions.headers = { authorization: "Bearer " + accessToken };
    }
    request.get(queryURL, requestOptions, function(err, response) {
      if (err) {
        return cb(err);
      } else if (response && response.statusCode !== 200) {
        var msg = body ? (body.message || body.error) : "unknown";
        cb(new Error("failure " + method + " : "  + msg));
      } else {
        cb(null, body);
      }
    });    
  };

  function QueryAPI(config) {
    this._version = config.version || "v1";
    this.query = query;
  }

  return QueryAPI;
}());