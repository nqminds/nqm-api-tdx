module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx:command");  
  var sendRequest = require("./send-request");
  var wait = require("./wait-for-resource");
  
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
        const waitForStatus = (!postData.indexStatus || postData.indexStatus === "pending") ? "built": postData.indexStatus;
        wait.waitForIndex.call(self, resp.response.id, waitForStatus, function(err) {
          cb(err, resp);
        });          
      } else {
        cb(err,resp);
      }
    });      
  };
  
  var setDatasetImportFlag = function(datasetId, importing,  cb) {
    var self = this;
    log("setDatasetImportFlag");
    return this._commandPost.call(this,"resource/importing", { id: datasetId, importing: importing }, function(err, resp) {
      if (!err) {
        // Wait for the flag.
        wait.waitForImportFlag.call(self, datasetId, importing, function(err) {
          cb(err, resp);
        });          
      } else {
        cb(err,resp);
      }
    }); 
  };
  
  var rebuildDatasetIndex = function(datasetId, cb) {
    var self = this;
    log("rebuildDatasetIndex");
    return this._commandPost.call(this,"resource/index/rebuild", { id: datasetId }, function(err, resp) {
      if (!err) {
        // Wait for the index status to be pending.
        // TODO - review - is it OK to wait for status to be built? Could take a while...
        wait.waitForIndex.call(self, datasetId, "built", function(err) {
          cb(err, resp);
        });          
      } else {
        cb(err,resp);
      }
    }); 
  };
  
  var suspendDatasetIndex = function(datasetId, cb) {
    var self = this;
    log("suspendDatasetIndex");
    return this._commandPost.call(this,"resource/index/suspend", { id: datasetId }, function(err, resp) {
      if (!err) {
        // Wait for the index status.
        wait.waitForIndex.call(self, datasetId, "suspended", function(err) {
          cb(err, resp);
        });          
      } else {
        cb(err,resp);
      }
    }); 
  };
  
  var truncateDataset = function(id, restart, cb) {
    var self = this;

    log("truncateDataset");
    if (typeof restart === "function") {
      cb = restart;
      restart = true;
    }

    return this.getDataset(id, function(err, resp) {
      var dataset;
      if (err) {
        return cb(err);
      }

      dataset = resp;
      log("about to truncate dataset and wait for store to not be %s and index status to be %s", dataset.store, dataset.indexStatus);      
      return self._commandPost.call(self,"resource/truncate", {id: id, noRestart: !restart}, function(err, resp) {
        if (!err) {
          // Wait for the store to change, 
          wait.waitForTruncate.call(self, id, dataset.store, function(err) {
            if (err) {
              return cb(err);
            }
            // Then wait for the index to restore.
            wait.waitForIndex.call(self, id, dataset.indexStatus, function(err) {
              cb(err, resp);
            });
          });          
        } else {
          cb(err,resp);
        }
      });
    }); 
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

  /*
   * Enables multiple datasets to be updated with a single API call.
   * 
   * Expects the 'data' param to be an array of data of the form:
   * 
   * {
   *    id: "<dataset id>",
   *    d: { <data document> }
   * }
   * 
   * Example:
   * 
   * { id: tempSensor1, d: { timestamp: 123, temperature: 12.3 }}
   * { id: tempSensor2, d: { timestamp: 123, temperature: 12.8 }}
   * { id: tempSensor1, d: { timestamp: 123, temperature: 12.3 }}
   * { id: co2Sensor, d: { timestamp: 123, co2: 587.6 }}
   * { id: xyz, d: { id: "foo", address: "nowhere" }}
   * 
   * This method will throw an error if any of the operations fail.
   * However, it processes the entire data array irrespective of failures,
   * so a failure does not prevent subsequent updates from happening.
   * 
   * In the event of an error, the error object message is a list of 
   * error details delimited by the '|' character, e.g.
   * 
   * catch(err => {
   *  const errors = err.message.split("|");
   *  console.log(errors); // ["duplicate key: timestamp: 123","dataset not found: xyz"]
   * })
   * 
   */
  var addDatasetsData = function(data, cb) {
    log("addDatasetsData");
    var postData = {
      payload: [].concat(data)
    };
    return this._commandPost.call(this,"dataset/data/feed", postData, cb);
  };

  var deleteDataset = function(id, cb) {
    log("deleteDataset");
    return this._commandPost.call(this,"resource/delete", { id: id }, cb);
  };

  function CommandAPI(config) {
    this._commandPost = sendRequest.post(config.commandHost + "/commandSync");
    this.createDataset = createDataset;
    this.truncateDataset = truncateDataset;
    this.addDatasetData = addDatasetData;
    this.addDatasetsData = addDatasetsData;
    this.updateDatasetData = updateDatasetData;
    this.setDatasetImportFlag = setDatasetImportFlag;
    this.suspendDatasetIndex = suspendDatasetIndex;
    this.rebuildDatasetIndex = rebuildDatasetIndex;
    this.deleteDataset = deleteDataset;
  }

  return CommandAPI;
}());