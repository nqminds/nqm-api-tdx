
module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx:command");  

  var waitForDatasetIndex = function(datasetId, retryCount, cb) {
    const indexPollingRetries = 20;
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
        dataset = resp;
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

  return waitForDatasetIndex;
}());