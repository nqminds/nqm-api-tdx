
module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx:send-request");
  var util = require("util");

  var defaultCallback = function(err) {
    if (err) {
      log("uncaught error: %s", err.message);
    }
  };

  function TDXApiError(message, stack) {
    this.name = "TDXApiError";
    this.message = message || "no message given";
    this.stack = stack || (new Error()).stack;
  }
  TDXApiError.prototype = Object.create(Error.prototype);
  TDXApiError.prototype.constructor = TDXApiError;

  var handleError = function(source, err, cb) {
    var code = typeof err.code === "undefined" ? "n/a" : err.code;
    var message = err.response ? (err.response.text || err.message) : err.message;
    var internal = {
      name: "TDXApiError",
      from: source,
      failure: message,
      stack: err.stack,
      code: code
    };
    return cb(new TDXApiError(JSON.stringify(internal), err.stack));
  };

  var postRequest = function(endpoint) {
    return function(command, postData, cb) {
      // log("sending %s with %j", command, postData);
      cb = cb || defaultCallback;

      var request = require("superagent");
      var url = util.format("%s/%s", endpoint, command);
      return request
        .post(url)
        .send(postData)
        .set({authorization: "Bearer " + this._accessToken})
        .end(function(err, res) {
          if (err) {
            handleError(command, err, cb);
          } else {
            if (!res.body) {
              // superagent sometimes doesn't work reliably because of this issue:
              // https://github.com/visionmedia/superagent/issues/990
              // The response.body is sometimes undefined when calling the command API?
              log("BAD RESPONSE - NO BODY >>>>>>> %j", res);
            }
            cb(null, res.body);
          }
        });

      // var request = require("request");
      // var options = {
      //   uri: util.format("%s/%s", endpoint, command),
      //   method: "POST",
      //   json: postData,
      //   headers: { authorization: "Bearer " + this._accessToken }
      // };

      // return request(options, function(err, res, body) {
      //   if (err) {
      //     var msg;
      //     if (err.response) {
      //       msg = util.format("%s failure: %s", command, err.response.text);
      //     } else {
      //       msg = util.format("%s failure: %s", command, err.message);
      //     }
      //     cb({name: "TDXApiError", message: msg, status: err.status, stack: err.stack, code: err.code });
      //   } else {
      //     cb(null, body);
      //   }
      // });
    };
  };

  var getRequest = function(endpoint) {
    return function(query, cb) {
      // log("sending %s", query);
      cb = cb || defaultCallback;

      var request = require("superagent");
      var url = util.format("%s/%s", endpoint, query);
      return request
        .get(url)
        .set(this._accessToken ? {authorization: "Bearer " + this._accessToken} : {})
        .end(function(err, res) {
          if (err) {
            handleError(query, err, cb);
          } else {
            if (!res.body) {
              // superagent sometimes doesn't work reliably because of this issue:
              // https://github.com/visionmedia/superagent/issues/990
              // The response.body is sometimes undefined when calling the command API?
              log("BAD RESPONSE - NO BODY >>>>>>> %j", res);
            }
            cb(null, res.body);
          }
        });
    };

    //   var request = require("request");
    //   var options = {
    //     uri: util.format("%s/%s", endpoint, query),
    //     method: "GET",
    //     json: true,
    //   };

    //   if (this._accessToken) {
    //     options.headers = {authorization: "Bearer " + this._accessToken};
    //   }

    //   return request(options, function(err, res, body) {
    //     if (err) {
    //       var msg;
    //       if (err.response) {
    //         msg = util.format("%s failure: %s", query, err.response.text);
    //       } else {
    //         msg = util.format("%s failure: %s", query, err.message);
    //       }
    //       cb({name: "TDXApiError", message: msg, status: err.status, stack: err.stack, code: err.code});
    //     } else {
    //       cb(null, body);
    //     }
    //   });
    // };
  };

  return {
    post: postRequest,
    get: getRequest,
  };
}());
