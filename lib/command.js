module.exports = (function() {
  "use strict";
  var log = require("debug")("hwrc-tdxAPI");
  var request = require("superagent");
  var util = require("util");

  var defaultArgs = function(accessToken, cb) {
    if (typeof accessToken === "function") {
      cb = accessToken;
      accessToken = null;
    }
    return {
      accessToken: accessToken || this._accessToken,
      cb: cb || function() {}
    }    
  };

  var handleResponse = function(description, err, response, cb) {
    var handledOK = false;
    if (err) {
      cb(err);
    } else if (response && response.status !== 200) {
      var msg = response.body ? (response.body.message || response.body.error) : "unknown";
      cb(new Error("failure " + description + " : "  + msg));
    } else {
      handledOK = true;
    }
    return handledOK;
  };

  var createDataset = function(postData, accessToken, cb) {
    var args = defaultArgs.call(this, accessToken, cb);
    var command = util.format("%s/commandSync/resource/create", this._config.commandHost);
    var header = { authorization: "Bearer " + args.accessToken };
    request.post(command).set(header).send(postData).end(function(err, response){
      if (handleResponse("create dataset", err, response, args.cb)) {
        log("status code is: %s", response.status);
        args.cb(err, response.body);
      }
    });
  };
  
  var truncateDataset = function(id, accessToken, cb) {
    var args = defaultArgs.call(this, accessToken, cb);
    var command = util.format("%s/commandSync/resource/truncate", this._config.commandHost);
    var postData = {};
    postData.id = id;
    var header = { authorization: "Bearer " + args.accessToken };
    request.post(command).set(header).send(postData).end(function(err, response) {
      if (handleResponse("truncate dataset", err, response, args.cb)) {
        log("status code is: %s", response.status);
        args.cb(err, response.body);
      }
    });
  };

  var addDatasetData = function(id, data, accessToken, cb) {
    var args = defaultArgs.call(this, accessToken, cb);
    var command = util.format("%s/commandSync/dataset/data/createMany", this._config.commandHost);
    var postData = {};
    postData.datasetId = id;
    postData.payload = [].concat(data);
    var header = { authorization: "Bearer " + args.accessToken };
    request.post(command).set(header).send(postData).end(function(err, response) {
      if (handleResponse("add dataset data", err, response, args.cb)) {
        args.cb(err, response.body);
      }
    });
  };

  var registerProcessHost = function(status, accessToken, cb) {
    var args = defaultArgs.call(this, accessToken, cb);
    var command = util.format("%s/commandSync/process/registerHost", this._config.commandHost);
    var postData = status;
    var header = { authorization: "Bearer " + args.accessToken };
    request.post(command).set(header).send(postData).end (function(err, response) {
      if (handleResponse("register process host", err, response, args.cb)) {
        args.cb(err, response.body);
      }
    });
  };

  var updateProcessStatus = function(processId, progress, status, accessToken, cb) {
    var args = defaultArgs.call(this, accessToken, cb);
    var command = util.format("%s/commandSync/process/status", this._config.commandHost);
    var postData = {
      processId: processId,
      progress: progress,
      status: status
    };
    var header = { authorization: "Bearer " + args.accessToken };
    request.post(command).set(header).send(postData).end(function(err, response) {
      if (handleResponse("update process status", err, response, args.cb)) {
        args.cb(err, response.body);
      }
    });
  };

  function CommandAPI(config) {
    this.createDataset = createDataset;
    this.truncateDataset = truncateDataset;
    this.addDatasetData = addDatasetData;
    this.registerProcessHost = registerProcessHost;
    this.updateProcessStatus = updateProcessStatus;
  }

  return CommandAPI;
}());