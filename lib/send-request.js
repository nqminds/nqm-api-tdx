
module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx:send-request");
  var request = require("request");
  var util = require("util");

  var defaultCallback = function(err) {
    if (err) {
      log("uncaught error: %s", err.message);
    }        
  };

  var postRequest = function(endpoint) {
    return function(command, postData, cb) {
      // log("sending %s with %j", command, postData);
      cb = cb || defaultCallback;
      
      var options = {
        uri: util.format("%s/%s", endpoint, command),
        method: "POST",
        json: postData,
        headers: { authorization: "Bearer " + this._accessToken } 
      };

      return request(options, function(err, res, body) {
        if (err) {
          var msg;
          if (err.response) {
            msg = util.format("%s failure: %s", command, err.response.text);
          } else {
            msg = util.format("%s failure: %s", command, err.message);
          }
          cb({name: "TDXApiError", message: msg, status: err.status, stack: err.stack, code: err.code });
        } else {
          cb(null, body);
        }
      });
    };
  };

  var getRequest = function(endpoint) {
    return function(query, cb) {
      // log("sending %s", query);
      cb = cb || defaultCallback;

      var options = {
        uri: util.format("%s/%s", endpoint, query),
        method: "GET",
        json: true
      };

      if (this._accessToken) {
        options.headers = { authorization: "Bearer " + this._accessToken }; 
      }
     
      return request(options, function(err, res, body) {
        if (err) {
          var msg;
          if (err.response) {
            msg = util.format("%s failure: %s", query, err.response.text);
          } else {
            msg = util.format("%s failure: %s", query, err.message);
          }
          cb({name: "TDXApiError", message: msg, status: err.status, stack: err.stack, code: err.code });
        } else {
          cb(null, body);
        }
      });
    };
  };

  return {
    post: postRequest,
    get: getRequest
  };

}());