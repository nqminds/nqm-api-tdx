module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx:command");  
  var sendRequest = require("./send-request");

  var createDataset = function(postData, cb) {
    log("createDataset");
    return this._commandPost.call(this,"resource/create", postData, cb);
  };
  
  var setDatasetImportFlag = function(datasetId, importing,  cb) {
    log("setDatasetImportFlag");
    return this._commandPost.call(this,"resource/importing", { id: datasetId, importing: importing }, cb);
  };
  
  var truncateDataset = function(id, cb) {
    log("truncateDataset");
    return this._commandPost.call(this,"resource/truncate", {id: id}, cb);
  };

  var addDatasetData = function(id, data, cb) {
    log("addDatasetData");
    var postData = {
      datasetId: id,
      payload: [].concat(data)    
    };
    return this._commandPost.call(this,"dataset/data/createMany", postData, cb);
  };

  var registerProcessHost = function(postData, cb) {
    log("registerProcessHost");
    return this._commandPost.call(this,"process/registerHost", postData, cb);
  };

  var updateProcessStatus = function(port, processId, status, cb) {
    log("updateProcessStatus");
    var postData = {
      hostPort: port,
      processId: processId,
      progress: status.progress,
      status: status.status,
      errorInfo: status.errorInfo
    };
    return this._commandPost.call(this,"process/status", postData, cb);
  };

  function CommandAPI(config) {
    this._commandPost = sendRequest.post(config.commandHost + "/commandSync/");
    this.createDataset = createDataset;
    this.truncateDataset = truncateDataset;
    this.addDatasetData = addDatasetData;
    this.setDatasetImportFlag = setDatasetImportFlag;
  }

  return CommandAPI;
}());