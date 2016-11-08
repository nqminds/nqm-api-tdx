
module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx:process");
  var sendRequest = require("./send-request");

  var registerHost = function(status, cb) {
    return this._databotHostPost("host/register", status, cb);
  };

  var updateStatus = function(status, cb) {
    return this._databotHostPost("host/status", status, cb);
  };

  var writeOutput = function(output, cb) {
    return this._databotHostPost("host/output", output, cb);
  }

  var getOutput = function(instanceId, processId, cb) {
    return this._databotGet("instance/output/" + instanceId + "/" + (processId || ""), cb);
  };

  var startDatabot = function(databotId, instanceData, cb) {
    return this._databotPost("databot/startInstance", { databotId: databotId, instanceData: instanceData }, cb);
  };

  var startPrivilegedDatabot = function(databotId, instanceData, cb) {
    return this._databotPost("databot/startPrivilegedInstance", { databotId: databotId, instanceData: instanceData }, cb);
  };

  var stopDatabot = function(instanceId, mode, cb) {
    return this._databotPost("databot/stopInstance", { instanceId: instanceId, mode: mode }, cb);
  };

  var getDatabot = function(instanceId, cb) {
    return this._databotGet("instance/" + instanceId, cb);
  };

  var getDatabotStatus = function(instanceId, cb) {
    return this._databotGet("instance/status/" + instanceId, cb);
  };

  function DatabotAPI(config) {
    this._databotHostPost = sendRequest.post(config.databotHost + "/");
    
    this._databotPost = sendRequest.post(config.commandHost + "/commandSync");
    this._databotGet = sendRequest.get(config.databotHost + "/");
    
    this.registerDatabotHost = registerHost;
    this.updateDatabotStatus = updateStatus;

    this.startDatabotInstance = startDatabot;
    this.startPrivilegedDatabotInstance = startPrivilegedDatabot;
    this.stopDatabotInstance = stopDatabot;

    this.getDatabotInstance = getDatabot;
    this.getDatabotInstanceStatus = getDatabotStatus;

    this.writeDatabotOutput = writeOutput;
    this.getDatabotOutput = getOutput;
  }

  return DatabotAPI;
}());