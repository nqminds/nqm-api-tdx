module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx:command");  
  var sendRequest = require("./send-request");
  var waitForDataset = require("./wait-for-resource");

  var createDataset = function(postData, waitForResource, cb) {
    var self = this;    
    //
    // Param waitForResource is optional => default to true
    if (typeof waitForResource === "function") {
      cb = waitForResource;
      waitForResource = true;
    }
    log("createDataset");
    return this._commandPost.call(this,"resource/create", postData, function(err, resp) {
      if (!err && waitForResource) {
        // Only wait for the index to be built if the dataset isn't importing
        waitForDataset.call(self,resp.response.id, postData.importing !== true, 0, cb);
      } else {
        cb(err,resp);
      }
    });      
  };
  
  var setDatasetImportFlag = function(datasetId, importing,  cb) {
    log("setDatasetImportFlag");
    return this._commandPost.call(this,"resource/importing", { id: datasetId, importing: importing }, cb);
  };
  
  var truncateDataset = function(id, restart, cb) {
    log("truncateDataset");
    if (typeof restart === "function") {
      cb = restart;
      restart = true;
    }
    return this._commandPost.call(this,"resource/truncate", {id: id, noRestart: !restart}, cb);
  };

  var addDatasetData = function(id, data, cb) {
    log("addDatasetData");
    var postData = {
      datasetId: id,
      payload: [].concat(data)    
    };
    return this._commandPost.call(this,"dataset/data/createMany", postData, cb);
  };

  var updateDatasetData = function(id, data, upsert, cb) {
    if (typeof upsert === "function") {
      cb = upsert;
      upsert = false;
    }
    log("updateDatasetData");
    var postData = {
      datasetId: id,
      payload: [].concat(data),
      __upsert: !!upsert    
    };
    return this._commandPost.call(this,"dataset/data/updateMany", postData, cb);    
  };

  function CommandAPI(config) {
    this._commandPost = sendRequest.post(config.commandHost + "/commandSync");
    this.createDataset = createDataset;
    this.truncateDataset = truncateDataset;
    this.addDatasetData = addDatasetData;
    this.updateDatasetData = updateDatasetData;
    this.setDatasetImportFlag = setDatasetImportFlag;
  }

  return CommandAPI;
}());