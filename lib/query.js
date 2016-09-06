module.exports = (function() {
  "use strict";
  var request = require("superagent");
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
      json: true,
      headers: {}
    };

    if (accessToken) {
      requestOptions.headers = { authorization: "Bearer " + accessToken };
    }

    request.get(queryURL)
      .set(requestOptions.headers)
      .end(function(err, response) {
        if (response && response.status !== 200) {
          var msg;
          if (response.body) {
            msg = response.body ? (response.body.message || response.body.error) : "unknown";
          } else if (response.text) {
            msg = response.text;
          } else {
            msg = "no error in response";
          }
          cb(new Error("failure " + method + " : "  + msg));
        } else if (err) {
          return cb(err);
        } else {
          cb(null, response.body);
        }
      });
  };

  function QueryAPI(config) {
    this._version = config.version || "v1";
    this.query = query;
  }

  return QueryAPI;
}());