module.exports = (function() {
  "use strict";
  var log = require("debug")("nqm-api-tdx");
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
    if (response && response.status !== 200) {
      var msg;
      if (response.body) {
        msg = response.body ? (response.body.message || response.body.error) : "unknown";
      } else if (response.text) {
        msg = response.text;
      } else {
        msg = "no error in response";
      }
      cb(new Error("failure " + description + " : "  + msg));
    } else if (err) {
      cb(err);
    } else {
      handledOK = true;
    }
    return handledOK;
  };

  var createDataset = function(postData, accessToken, cb) {
    log("createDataset");
    var args = defaultArgs.call(this, accessToken, cb);
    var command = util.format("%s/commandSync/resource/create", this._config.commandHost);
    var header = { authorization: "Bearer " + args.accessToken };
    request.post(command)
      .set(header)
      .send(postData)
      .end(function(err, response){
        log("response: %j", response);
        if (handleResponse("create dataset", err, response, args.cb)) {
          log("status code is: %s", response.status);
          args.cb(err, response.body);
        }
      });
  };
  
  var setDatasetImportFlag = function(datasetId, importing, accessToken, cb) {
    var args = defaultArgs.call(this, accessToken, cb);
    var command = util.format("%s/commandSync/resource/importing", this._config.commandHost);
    var header = { authorization: "Bearer " + args.accessToken };
    var postData = {
      id: datasetId,
      importing: importing
    }
    request.post(command)
      .set(header)
      .send(postData)
      .end(function(err, response){
        if (handleResponse("set dataset importing flag", err, response, args.cb)) {
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
    request.post(command)
      .set(header)
      .send(postData)
      .end(function(err, response) {
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
    request.post(command)
      .set(header)
      .send(postData)
      .end(function(err, response) {
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
    request.post(command)
      .set(header)
      .send(postData)
      .end (function(err, response) {
        if (handleResponse("register process host", err, response, args.cb)) {
          args.cb(err, response.body);
        }
      });
  };

  var updateProcessStatus = function(port, processId, status, accessToken, cb) {
    var args = defaultArgs.call(this, accessToken, cb);
    var command = util.format("%s/commandSync/process/status", this._config.commandHost);
    var postData = {
      hostPort: port,
      processId: processId,
      progress: status.progress,
      status: status.status,
      errorInfo: status.errorInfo
    };
    var header = { authorization: "Bearer " + args.accessToken };
    request.post(command)
      .set(header)
      .send(postData)
      .end(function(err, response) {
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
    this.setDatasetImportFlag = setDatasetImportFlag;
  }

  return CommandAPI;
}());