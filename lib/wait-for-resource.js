
module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx:wait-for-resource");
  var pollingRetries = 15;
  var pollingInterval = 1000;

  var waitForResource = function(datasetId, check, retryCount, maxRetries, cb) {
    var self = this;

    retryCount = retryCount || 0;
    this.getDataset(datasetId, function(err, resp) {
      var dataset;

      if (err) {
        if (err.name !== "TDXApiError") {
          return cb(err);
        } else {
          try {
            var parseError = JSON.parse(err.message);
            var failure = JSON.parse(parseError.failure);
            // Restify error code had the 'Error' suffix removed post v3.x
            if (
              failure.code === "NotFound" ||
              failure.code === "NotFoundError" ||
              failure.code === "Unauthorized" ||
              failure.code === "UnauthorizedError"
            ) {
              // Ignore resource not found and not authorized errors here, they are probably caused by
              // waiting for the projections to catch up (esp. in debug environments).

              // Check for special case of expired bearer token authorization errors.
              if (
                (failure.code === "Unauthorized" || failure.code === "UnauthorizedError") &&
                failure.message &&
                failure.message.indexOf("Bearer token invalid") === 0
              ) {
                // Expired tokens will never recover until a new token is acquired - abort now.
                return cb(err);
              }
              // By falling through (i.e. not calling back) we will still be limited by the retry count,
              // so won't loop forever (unless retry count is inifinity).
              log("waitForResource - ignoring error %s", err.message);
            } else {
              // All other errors are fatal.
              return cb(err);
            }
          } catch (parseEx) {
            // Failed to parse TDX error - re-throw the original error.
            return cb(err);
          }
        }
      } else {
        dataset = resp;
      }

      var checkResult = check(dataset, retryCount);
      if (checkResult instanceof Error) {
        log("waitForResource - check failed with error [%s]", checkResult.message);
        return cb(checkResult);
      }

      if (!checkResult) {
        // A negative maxRetries value will retry infinitely.
        if (maxRetries >= 0 && retryCount > maxRetries) {
          log("waitForResource - giving up after %d attempts", retryCount);
          return cb(new Error("gave up waiting for " + datasetId + " after " + retryCount + " attempts"));
        }
        // Try again after a delay.
        log("waitForResource - waiting for %d msec", pollingInterval);
        setTimeout(function() {
          waitForResource.call(self, datasetId, check, retryCount+1, maxRetries, cb);
        }, pollingInterval);
      } else {
        cb(null, dataset);
      }
    });
  };

  var waitForIndex = function(datasetId, status, maxRetries, cb) {
    // The argument maxRetries is optional.
    if (typeof maxRetries === "function") {
      cb = maxRetries;
      maxRetries = pollingRetries;
    }
    var initialStatus = "";

    var builtIndexCheck = function(dataset, retryCount) {
      log("builtIndexCheck: %s", dataset ? dataset.indexStatus : "no dataset");

      var continueWaiting;

      // Handle "error" index status.
      if (dataset && dataset.indexStatus === "error") {
        if (!initialStatus) {
          // Haven't got an initial status yet, so can't make a judgment as to whether or not the error status
          // is new, or the index was already in an error state.
          continueWaiting = true;
        } else if (initialStatus !== "error") {
          // The index status has transitioned from non-error to error => abort
          continueWaiting = new Error("index entered error status");
        } else {
          // The index status started as an error and is still an error => allow a limited number of retries
          // irrespective of the requested maxRetries.
          if (retryCount > Math.min(maxRetries, pollingRetries)) {
            continueWaiting = new Error("index still in error status after " + retryCount + " retries");
          } else {
            continueWaiting = true;
          }
        }
      } else {
        continueWaiting = !!dataset && dataset.indexStatus === status;
      }

      // Cache the first index status we see.
      if (dataset && !initialStatus) {
        initialStatus = dataset.indexStatus;
      }

      return continueWaiting;
    };
    return waitForResource.call(this, datasetId, builtIndexCheck, 0, maxRetries, cb);
  };

  var waitForExists = function(datasetId, cb) {
    var existsCheck = function(dataset) {
      log("existsCheck: %s", dataset ? dataset.id : "no dataset");
      return !!dataset;
    };
    return waitForResource.call(this, datasetId, existsCheck, 0, pollingRetries, cb);
  };

  var waitForImportFlag = function(datasetId, flag, cb) {
    var importFlagCheck = function(dataset) {
      log("importFlagCheck: %s", dataset ? dataset.importing : "no dataset");
      return !!dataset && dataset.importing === flag;
    };
    return waitForResource.call(this, datasetId, importFlagCheck, 0, pollingRetries, cb);
  };

  var waitForTruncate = function(datasetId, oldStore, cb) {
    var storeCheck = function(dataset) {
      log("storeCheck: %s", dataset ? dataset.store : "no dataset");
      return !!dataset && dataset.store !== oldStore;
    }
    return waitForResource.call(this, datasetId, storeCheck, 0, pollingRetries, cb);
  };

  return {
    waitForExists: waitForExists,
    waitForIndex: waitForIndex,
    waitForImportFlag: waitForImportFlag,
    waitForTruncate: waitForTruncate
  };
}());