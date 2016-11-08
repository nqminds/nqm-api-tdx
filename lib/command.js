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
        if (postData.importing !== true) {
          // Only wait for the index to be built if the dataset isn't importing
          wait.waitForIndex.call(self,resp.response.id, 0, function(err) {
            cb(err, resp);
          });          
        } else {
          // Dataset is importing - just wait for it to exist.
          wait.waitForExists.call(self,resp.response.id, 0, function(err) {
            cb(err, resp);
          });          
        }
      } else {
        cb(err,resp);
      }
    });      
  };
  
  var setDatasetImportFlag = function(datasetId, importing,  cb) {
    log("setDatasetImportFlag");
    return this._commandPost.call(this,"resource/importing", { id: datasetId, importing: importing }, cb);
  };
  
  var setDatasetIndexStatus = function(datasetId, importing,  cb) {
    log("setDatasetIndexStatus");
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

  function CommandAPI(config) {
    this._commandPost = sendRequest.post(config.commandHost + "/commandSync");
    this.createDataset = createDataset;
    this.truncateDataset = truncateDataset;
    this.addDatasetData = addDatasetData;
    this.addDatasetsData = addDatasetsData;
    this.updateDatasetData = updateDatasetData;
    this.setDatasetImportFlag = setDatasetImportFlag;
  }

  return CommandAPI;
}());