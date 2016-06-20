module.exports = (function() {
  "use strict";
  var request = require("request");
  var util = require("util");
  var BaseAPI = require("./API");

  function QueryAPI(baseURL, version) {
    BaseAPI.call(this, baseURL);
    this._version = version || "v1";
  }

  util.inherits(QueryAPI, BaseAPI);

  QueryAPI.prototype.query = function(method, filter, projection, options, cb) {
    filter = filter ? JSON.stringify(filter) : "";
    projection = projection ? JSON.stringify(projection) : "";
    options = options ? JSON.stringify(options) : "";
    var queryURL = util.format("%s/%s/%s?filter=%s&proj=%s&opts=%s", this._baseURL, this._version, method, filter, projection, options);
    var requestOptions = {
      json: true
    };
    if (this._accessToken) {
      requestOptions.headers = { authorization: "Bearer " + this._accessToken };
    }
    request.get(queryURL, requestOptions, cb);    
  };

  return QueryAPI;
}());