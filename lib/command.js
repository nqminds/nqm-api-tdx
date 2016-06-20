module.exports = (function() {
  "use strict";
  var log = require("debug")("hwrc-tdxAPI");
  var request = require("request");
  var util = require("util");
  var BaseAPI = require("./API");

  function CommandAPI(baseURL) {
    BaseAPI.call(this, baseURL);
    this._version = version || "v1";
  }

  util.inherits(CommandAPI, BaseAPI);
  
  CommandAPI.prototype.truncateDataset = function(id, cb) {
    var command = util.format("%s/commandSync/resource/truncate", this._baseURL);
    var postData = {};
    postData.id = id;
    request.post({ url: command, headers: { authorization: "Bearer " + this._accessToken }, json: true, body: postData }, function(err, response, body) {
      if (err) {
        cb(err);
      } else if (response && response.statusCode !== 200) {
        cb(new Error("failed to truncate dataset: " + (body.message || body.error)));
      } else {
        log("status code is: %s", response.statusCode);
        cb(err, body);
      }
    });
  };

  CommandAPI.prototype.addDatasetData = function(id, data, cb) {
    var command = util.format("%s/commandSync/dataset/data/createMany", this._baseURL);
    var postData = {};
    postData.datasetId = id;
    postData.payload = data;
    request.post({ url: command, headers: { authorization: "Bearer " + this._accessToken }, json: true, body: postData }, function(err, response, body) {
      if (err) {
        cb(err);
      } else if (response && response.statusCode !== 200) {
        cb(new Error("failed to add dataset data: " + (body.message || body.error)));
      } else {
        cb(err, body);
      }          
    });
  };

  return CommandAPI;
}());