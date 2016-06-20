module.exports = (function() {
  "use strict";
  var request = require("request");
  var util = require("util");

  function API(baseURL) {
    this._baseURL = baseURL;
    this._accessToken = "";
  }
  
  API.prototype.authenticate = function(usr,pwd,cb) {
    var self = this;
    var options = {
      uri: util.format("%s/token", this._baseURL),
      headers: { "Authorization": "Basic " + usr + ":" + pwd },
      json: true,
      body: { grant_type: "client_credentials"}
    };
    request.post(options, function(err, qres, body) {
      if (err) { 
        return cb(err); 
      }
      if (qres.statusCode === 200) {
        self._accessToken = body.access_token;
        cb(null, self._accessToken);
      } else {
        cb(null, body || "unknown error");
      }
    });
  };

  return API;
}());