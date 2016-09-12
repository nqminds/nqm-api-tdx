
module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx:send-request");
  var request = require("superagent");
  var util = require("util");

  var defaultCallback = function(err) {
    if (err) {
      log("uncaught error: %s", err.message);
    }        
  };

  var postRequest = function(endpoint) {
    return function(command, postData, cb) {
      log("sending %s with %j", command, postData);
      cb = cb || defaultCallback;
      var url = util.format("%s/%s", endpoint, command);
      
      request
        .post(url)
        .send(postData)
        .set({ authorization: "Bearer " + this._accessToken })
        .end(function(err, res) {
          if (err) {
            var msg;
            if (err.response) {
              msg = util.format("%s failure: %s", command, err.response.text);
            } else {
              msg = util.format("%s failure: %s", command, err.message);
            }
            cb({name: "TDXApiError", message: msg, status: err.status, stack: err.stack });
          } else {
            if (!res.body) {
              // superagent sometimes doesn't work reliably because of this issue:
              // https://github.com/visionmedia/superagent/issues/990
              // The response.body is sometimes undefined when calling the command API?
              log("BAD RESPONSE - NO BODY >>>>>>> %j", res);
            }
            cb(null, res.body);
          }
        })
    }
  };

  return {
    post: postRequest
  };

}());