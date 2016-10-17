module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx:command");  
  var sendRequest = require("./send-request");
  var query = require("./query");  

  var waitForDatasetIndex = function(datasetId, retryCount, cb) {
    const indexPollingRetries = 15;
    const indexPollingInterval = 1000;
    const self = this;
    retryCount = retryCount || 0;
    this.getDataset(datasetId, function(err, resp) {
      var dataset;

      if (err) {
        // Ignore errors here, they are probably caused by waiting for the projections to catch up (esp. in debug environments)
        // By falling through we will still be limited by the retry count, so won't loop forever
        log("waitForDatasetIndex - ignoring error %s",err.message);
      } else {
        dataset = resp.body;
      }
      
      if (!dataset || dataset.indexStatus === "pending") {
        if (retryCount > indexPollingRetries) {
          log("waitForDatasetIndex giving up after %d attempts", retryCount);
          return cb(new Error("gave up waiting for index for " + datasetId + " after " + retryCount + " attempts"));
        }
        // Index is still pending => try again after a delay.
        log("waitForDatasetIndex - index pending, waiting for %d msec", indexPollingInterval);
        setTimeout(function() {
          waitForDatasetIndex.call(self, datasetId, retryCount+1, cb);
        }, indexPollingInterval);
      } else if (dataset.indexStatus !== "built") {
        // We're expecting a 'built' status.
        log("unexpected index status: %s", dataset.indexStatus);
        cb(new Error("waitForDatasetIndex - unexpected dataset index status: " + dataset.indexStatus));
      } else {
        cb(null, dataset);
      }
    });
  };

  var createDataset = function(postData, waitForIndex, cb) {
    const self = this;    
    //
    // Param waitForIndex is optional => default to true
    if (typeof waitForIndex === "function") {
      cb = waitForIndex;
      waitForIndex = true;
    }
    log("createDataset");
    return this._commandPost.call(this,"resource/create", postData, function(err, resp) {
      if (!err && waitForIndex) {
        waitForDatasetIndex.call(self,resp.response.id, 0, cb);
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