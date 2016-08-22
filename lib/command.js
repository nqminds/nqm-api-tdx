module.exports = (function() {
  "use strict";
  var log = require("debug")("hwrc-tdxAPI");
  var request = require("request");
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

  var handleResponse = function(description, err, response, body, cb) {
    var handledOK = false;
    if (err) {
      cb(err);
    } else if (response && response.statusCode !== 200) {
      var msg = body ? (body.message || body.error) : "unknown";
      cb(new Error("failure " + description + " : "  + msg));
    } else {
      handledOK = true;
    }
    return handledOK;
  };

  var createDataset = function(postData, accessToken, cb) {
    var args = defaultArgs.call(this, accessToken, cb);
    var command = util.format("%s/commandSync/resource/create", this._config.commandHost);
    request.post({ url: command, headers: { authorization: "Bearer " + args.accessToken }, json: true, body: postData }, function(err, response, body) {
      if (handleResponse("create dataset", err, response, body, args.cb)) {
        log("status code is: %s", response.statusCode);
        args.cb(err, body);
      }      
    });
  };
  
  var truncateDataset = function(id, accessToken, cb) {
    var args = defaultArgs.call(this, accessToken, cb);
    var command = util.format("%s/commandSync/resource/truncate", this._config.commandHost);
    var postData = {};
    postData.id = id;
    request.post({ url: command, headers: { authorization: "Bearer " + args.accessToken }, json: true, body: postData }, function(err, response, body) {
      if (handleResponse("truncate dataset", err, response, body, args.cb)) {
        log("status code is: %s", response.statusCode);
        args.cb(err, body);
      }
    });
  };

  var addDatasetData = function(id, data, accessToken, cb) {
    var args = defaultArgs.call(this, accessToken, cb);
    var command = util.format("%s/commandSync/dataset/data/createMany", this._config.commandHost);
    var postData = {};
    postData.datasetId = id;
    postData.payload = [].concat(data);
    request.post({ url: command, headers: { authorization: "Bearer " + args.accessToken }, json: true, body: postData }, function(err, response, body) {
      if (handleResponse("add dataset data", err, response, body, args.cb)) {
        args.cb(err, body);
      }
    });
  };

  var registerProcessHost = function(status, accessToken, cb) {
    var args = defaultArgs.call(this, accessToken, cb);
    var command = util.format("%s/commandSync/process/registerHost", this._config.commandHost);
    var postData = status;
    request.post({ url: command, headers: { authorization: "Bearer " + args.accessToken }, json: true, body: postData }, function(err, response, body) {
      if (handleResponse("register process host", err, response, body, args.cb)) {
        args.cb(err, body);
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
    request.post({ url: command, headers: { authorization: "Bearer " + args.accessToken }, json: true, body: postData }, function(err, response, body) {
      if (handleResponse("update process status", err, response, body, args.cb)) {
        args.cb(err, body);
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