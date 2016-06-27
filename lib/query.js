module.exports = (function() {
  "use strict";
  var request = require("request");
  var util = require("util");

  var query = function(accessToken, method, filter, projection, options, cb) {
    filter = filter ? JSON.stringify(filter) : "";
    projection = projection ? JSON.stringify(projection) : "";
    options = options ? JSON.stringify(options) : "";
    var queryURL = util.format("%s/%s/%s?filter=%s&proj=%s&opts=%s", this._config.baseQueryURL, this._version, method, filter, projection, options);
    var requestOptions = {
      json: true
    };
    if (accessToken) {
      requestOptions.headers = { authorization: "Bearer " + accessToken };
    }
    request.get(queryURL, requestOptions, cb);    
  };

  function QueryAPI(config) {
    this._version = config.version || "v1";
    this.query = query;
  }

  return QueryAPI;
}());