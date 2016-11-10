
module.exports = (function() {
  "use strict";

  const log = require("debug")("nqm-api-tdx:wait-for-resource");  
  const pollingRetries = 15;
  const pollingInterval = 1000;

  var waitForResource = function(datasetId, check, retryCount, cb) {
    const self = this;
    
    retryCount = retryCount || 0;
    this.getDataset(datasetId, function(err, resp) {
      var dataset;

      if (err) {
        // Ignore errors here, they are probably caused by waiting for the projections to catch up (esp. in debug environments)
        // By falling through we will still be limited by the retry count, so won't loop forever
        log("waitForResource - ignoring error %s",err.message);
      } else {
        dataset = resp;
      }
            
      if (!check(dataset)) {
        if (retryCount > pollingRetries) {
          log("waitForResource - giving up after %d attempts", retryCount);
          return cb(new Error("gave up waiting for " + datasetId + " after " + retryCount + " attempts"));
        }
        // Try again after a delay.
        log("waitForResource - waiting for %d msec", pollingInterval);
        setTimeout(function() {
          waitForResource.call(self, datasetId, check, retryCount+1, cb);
        }, pollingInterval);
      } else {
        cb(null, dataset);
      }
    });
  };

  var waitForIndex = function(datasetId, status, cb) {
    var builtIndexCheck = function(dataset) {
      log("builtIndexCheck: %s", dataset ? dataset.indexStatus : "no dataset");
      return !!dataset && dataset.indexStatus === status;
    };
    return waitForResource.call(this, datasetId, builtIndexCheck, 0, cb);
  };

  var waitForExists = function(datasetId, cb) {
    var existsCheck = function(dataset) {
      log("existsCheck: %s", dataset ? dataset.id : "no dataset");    
      return !!dataset;
    };
    return waitForResource.call(this, datasetId, existsCheck, 0, cb);
  };

  var waitForImportFlag = function(datasetId, flag, cb) {
    var importFlagCheck = function(dataset) {
      log("importFlagCheck: %s", dataset ? dataset.importing : "no dataset");    
      return !!dataset && dataset.importing === flag;
    };
    return waitForResource.call(this, datasetId, importFlagCheck, 0, cb);
  };

  var waitForTruncate = function(datasetId, oldStore, cb) {
    var storeCheck = function(dataset) {
      log("storeCheck: %s", dataset ? dataset.store : "no dataset");
      return !!dataset && dataset.store !== oldStore;
    }
    return waitForResource.call(this, datasetId, storeCheck, 0, cb);
  };

  return {
    waitForExists: waitForExists,
    waitForIndex: waitForIndex,
    waitForImportFlag: waitForImportFlag,
    waitForTruncate: waitForTruncate     
  };
}());