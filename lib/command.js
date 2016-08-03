module.exports = (function() {
  "use strict";
  var log = require("debug")("hwrc-tdxAPI");
  var request = require("request");
  var util = require("util");

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
    if (typeof accessToken === "function") {
      cb = accessToken;
      accessToken = this._accessToken;
    }
    var command = util.format("%s/commandSync/resource/create", this._config.commandHost);
    request.post({ url: command, headers: { authorization: "Bearer " + accessToken }, json: true, body: postData }, function(err, response, body) {
      if (handleResponse("create dataset", err, response, body, cb)) {
        log("status code is: %s", response.statusCode);
        cb(err, body);
      }      
    });
  };
  
  var truncateDataset = function(id, accessToken, cb) {
    if (typeof accessToken === "function") {
      cb = accessToken;
      accessToken = this._accessToken;
    }
    var command = util.format("%s/commandSync/resource/truncate", this._config.commandHost);
    var postData = {};
    postData.id = id;
    request.post({ url: command, headers: { authorization: "Bearer " + accessToken }, json: true, body: postData }, function(err, response, body) {
      if (handleResponse("truncate dataset", err, response, body, cb)) {
        log("status code is: %s", response.statusCode);
        cb(err, body);
      }
    });
  };

  var addDatasetData = function(id, data, accessToken, cb) {
    if (typeof accessToken === "function") {
      cb = accessToken;
      accessToken = this._accessToken;
    }
    var command = util.format("%s/commandSync/dataset/data/createMany", this._config.commandHost);
    var postData = {};
    postData.datasetId = id;
    postData.payload = [].concat(data);
    request.post({ url: command, headers: { authorization: "Bearer " + accessToken }, json: true, body: postData }, function(err, response, body) {
      if (handleResponse("add dataset data", err, response, body, cb)) {
        cb(err, body);
      }
    });
  };

  function CommandAPI(config) {
    this.createDataset = createDataset;
    this.truncateDataset = truncateDataset;
    this.addDatasetData = addDatasetData;
  }

  return CommandAPI;
}());