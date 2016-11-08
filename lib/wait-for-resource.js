
module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx:command");  

  // var waitForResource = function(datasetId, waitForIndex, retryCount, cb) {
  //   const pollingRetries = 15;
  //   const pollingInterval = 1000;
  //   const self = this;
  //   retryCount = retryCount || 0;
  //   this.getDataset(datasetId, function(err, resp) {
  //     var dataset;

  //     if (err) {
  //       // Ignore errors here, they are probably caused by waiting for the projections to catch up (esp. in debug environments)
  //       // By falling through we will still be limited by the retry count, so won't loop forever
  //       log("waitForResource - ignoring error %s",err.message);
  //     } else {
  //       dataset = resp;
  //     }
      
  //     if (!dataset || (waitForIndex && dataset.indexStatus === "pending")) {
  //       if (retryCount > pollingRetries) {
  //         log("waitForResource giving up after %d attempts", retryCount);
  //         return cb(new Error("gave up waiting for index for " + datasetId + " after " + retryCount + " attempts"));
  //       }
  //       // Index is still pending => try again after a delay.
  //       log("waitForResource - index pending, waiting for %d msec", pollingInterval);
  //       setTimeout(function() {
  //         waitForResource.call(self, datasetId, waitForIndex, retryCount+1, cb);
  //       }, pollingInterval);
  //     } else if (waitForIndex && dataset.indexStatus !== "built") {
  //       // We're expecting a 'built' status.
  //       log("unexpected index status: %s", dataset.indexStatus);
  //       cb(new Error("waitForResource - unexpected dataset index status: " + dataset.indexStatus));
  //     } else {
  //       cb(null, dataset);
  //     }
  //   });
  // };

  var waitForResource = function(datasetId, check, retryCount, cb) {
    const pollingRetries = 15;
    const pollingInterval = 1000;
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
          return cb(new Error("gave up waiting for index for " + datasetId + " after " + retryCount + " attempts"));
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

  var waitForResourceIndex = function(datasetId, retryCount, cb) {
    var builtIndexCheck = function(dataset) {
      return !!dataset && dataset.indexStatus === "built";
    };
    return waitForResource.call(this, datasetId, builtIndexCheck, retryCount, cb);
  };

  var waitForResource = function(datasetId, retryCount, cb) {
    var existsCheck = function(dataset) {    
      return !!dataset;
    };
    return waitForResource.call(this, datasetId, existsCheck, retryCount, cb);
  };

  var waitForImportFlag = function(datasetId, flag, retryCount, cb) {
    var importFlagCheck = function(dataset) {    
      return !!dataset && dataset.importing === flag;
    };
    return waitForResource.call(this, datasetId, importFlagCheck, retryCount, cb);
  };

  return {
    waitForExists: waitForResource,
    waitForIndex: waitForResourceIndex,
    waitForImportFlag: waitForImportFlag     
  };
}());