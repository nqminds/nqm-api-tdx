
module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx:process");
  var sendRequest = require("./send-request");

  var registerHost = function(status, cb) {
    return this._processPost("host/register", status, cb);
  };

  var updateProcessStatus = function(status, cb) {
    return this._processPost("host/status", status, cb);
  };

  function ProcessAPI(config) {
    this._processPost = sendRequest.post(config.processHost + "/"); 
    this.registerProcessHost = registerHost;
    this.updateProcessStatus = updateProcessStatus;
  }

  return ProcessAPI;
}());