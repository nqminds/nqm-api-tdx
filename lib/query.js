module.exports = (function() {
  "use strict";

  var sendRequest = require("./send-request");
  var util = require("util");
  var waitForDataset = require("./wait-for-resource");

  var query = function(method, filter, projection, options, cb) {
    filter = filter ? JSON.stringify(filter) : "";
    projection = projection ? JSON.stringify(projection) : "";
    options = options ? JSON.stringify(options) : "";
    var queryURL = util.format("%s?filter=%s&proj=%s&opts=%s", method, filter, projection, options);
    return this._queryGet(queryURL, cb);
  };

  var getDataset = function(datasetId, waitForIndex, cb) {
    var self = this;
    //
    // Param waitForIndex is optional => default to false for queries
    if (typeof waitForIndex === "function") {
      cb = waitForIndex;
      waitForIndex = false;
    }
    return query.call(this, "datasets/" + datasetId, null, null, null, function(err, resp) {
      if (!err && waitForIndex) {
        waitForDataset.call(self,datasetId, 0, !!waitForIndex, cb);        
      } else {
        cb(err, resp);
      }
    });
  };

  var getDatasetData = function(datasetId, filter, projection, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = undefined;
    }
    if (typeof projection === "function") {
      cb = projection;
      projection = options = undefined;
    }
    if (typeof filter === "function") {
      cb = filter;
      filter = projection = options = undefined;
    }
    return query.call(this,"datasets/" + datasetId + "/data", filter, projection, options, cb);
  };

  var getNDDatasetData = function(datasetId, filter, projection, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = undefined;
    }
    if (typeof projection === "function") {
      cb = projection;
      projection = options = undefined;
    }
    if (typeof filter === "function") {
      cb = filter;
      filter = projection = options = undefined;
    }
    return query.call(this,"datasets/" + datasetId + "/nddata", filter, projection, options, cb);
  };

  var getDatasets = function(filter, projection, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = undefined;
    }
    if (typeof projection === "function") {
      cb = projection;
      projection = options = undefined;
    }
    if (typeof filter === "function") {
      cb = filter;
      filter = projection = options = undefined;
    }
    return query.call(this,"datasets", filter, projection, options, cb);
  };

  var getDatasetDataCount = function(datasetId, filter, cb) {
    if (typeof filter === "function") {
      cb = filter;
      filter = undefined;
    }
    return query.call(this,"datasets/" + datasetId + "/count", filter, null, null, cb);    
  };

  var getRawFile = function(datasetId, cb) {
    return query.call(this,"resource/" + datasetId + "/preview", null, null, null, cb);
  };

  function QueryAPI(config) {
    this._version = config.version || "v1";
    this._queryGet = sendRequest.get(config.queryHost + "/" + this._version);
    this.query = query;
    this.getDataset = getDataset;
    this.getDatasetData = getDatasetData;
    this.getDatasets = getDatasets;
    this.getNDDatasetData = getNDDatasetData;
    this.getDatasetDataCount = getDatasetDataCount;
    this.getRawFile = getRawFile;
  }

  return QueryAPI;
}());