
module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx:process");
  var sendRequest = require("./send-request");

  var registerHost = function(status, cb) {
    return this._processPost("host/register", status, cb);
  };

  var updateStatus = function(status, cb) {
    return this._processPost("host/status", status, cb);
  };

  function ProcessAPI(config) {
    this._processPost = sendRequest.post(config.databotHost + "/");
    this.registerDatabotHost = registerHost;
    this.updateDatabotStatus = updateStatus;
  }

  return ProcessAPI;
}());