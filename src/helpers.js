import debug from "debug";

const pollingRetries = 15;
const pollingInterval = 1000;
const waitInfinitely = -1;

const TDXApiError = function(message, stack) {
  this.name = "TDXApiError";
  this.message = message || "no message given";
  this.stack = stack || (new Error()).stack;
};

TDXApiError.prototype = Object.create(Error.prototype);
TDXApiError.prototype.constructor = TDXApiError;

const handleError = function(source, failure, code) {
  const internal = {
    from: source,
    failure: JSON.stringify(failure),
    code: typeof code === "undefined" ? "n/a" : code,
  };
  return new TDXApiError(JSON.stringify(internal), (new Error()).stack);
};

/**
 * Builds a Request object for the given command bound to the TDX command service.
 * @param  {string} command - the target TDX command, e.g. "resource/create"
 * @param  {object} data - the command payload
 * @param  {string} [contentType=application/json] - the content type
 * @param  {bool} [noSync=false] - send command asynchronously
 */
const buildCommandRequest = function(command, data, contentType, async) {
  const commandMode = async ? "command" : "commandSync";
  contentType = contentType || "application/json";
  return new Request(`${this.config.commandHost}/${commandMode}/${command}`, {
    method: "POST",
    mode: "cors",
    headers: new Headers({
      "Authorization": `Bearer ${this.accessToken}`,
      "Content-Type": contentType,
    }),
    body: JSON.stringify(data),
  });
};

/**
 * Builds a Request object for the given query bound to the TDX query engine.
 * @param  {string} endpoint - the query endpoint, e.g. "resources/DKJF8d8f"
 * @param  {object} [filter] - a filter expression, e.g. {"temperature": {$gt: 18}}
 * @param  {object} [projection] - a projection definition defining what data will be returned, e.g. {sensorId: 1,
 * temperature: 1}
 * @param  {object} [options] - query options, e.g. {limit: 10, sort: {timestamp: -1}}
 */
const buildQueryRequest = function(endpoint, filter, projection, options) {
  filter = filter ? JSON.stringify(filter) : "";
  projection = projection ? JSON.stringify(projection) : "";
  options = options ? JSON.stringify(options) : "";
  let query;
  if (endpoint.indexOf("?") < 0) {
    // There is no query portion in the prefix - add one now.
    query = `${endpoint}?filter=${filter}&proj=${projection}&opts=${options}`;
  } else {
    // There is already a query portion, so append the params.
    query = `${endpoint}&filter=${filter}&proj=${projection}&opts=${options}`;
  }
  return new Request(`${this.config.queryHost}${query}`, {
    method: "GET",
    mode: "cors",
    headers: new Headers({
      "Authorization": `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    }),
  });
};

const checkResponse = function(source, response) {
  return response.json()
    .then((json) => {
      if (response.ok) {
        return Promise.resolve(json);
      } else {
        if (json.error) {
          // Build a failure object from the json response.
          const failure = {code: json.error, message: json.error_description};
          return Promise.reject(handleError(source, failure, response.status));
        } else {
          // The response body holds the error details.
          return Promise.reject(handleError(source, json, response.status));
        }
      }
    });
};

const setDefaults = function(config) {
  const log = debug("nqm-api-tdx:setDefaults");
  if (config.tdxHost && (!config.queryHost || !config.commandHost)) {
    const protocolComponents = config.tdxHost.split("://");
    if (protocolComponents.length !== 2) {
      throw new Error(`invalid tdxHost in config - no protocol: ${config.tdxHost}`);
    }
    const protocol = protocolComponents[0];
    const hostComponents = protocolComponents[1].split(".");
    if (hostComponents.length < 3) {
      throw new Error(`invalid tdxHost in config - expected sub.domain.tld: ${config.tdxHost}`);
    }
    const hostname = hostComponents.slice(1).join(".");
    config.commandHost = config.commandHost || `${protocol}://cmd.${hostname}`;
    config.queryHost = config.queryHost || `${protocol}://q.${hostname}/v1/`;
    config.databotHost = config.databotHost || `${protocol}://databot.${hostname}`;
    log(
      "defaulted hosts to %s, %s, %s",
      config.commandHost,
      config.queryHost,
      config.databotHost
    );
  }
};

const waitForResource = function(resourceId, check, retryCount, maxRetries) {
  const log = debug("nqm-api-tdx:waitForResource");
  retryCount = retryCount || 0;
  return this.getResource(resourceId)
    .then((resource) => {
      const checkResult = check(resource, retryCount);
      if (checkResult instanceof Error) {
        log("waitForResource - check failed with error [%s]", checkResult.message);
        return Promise.reject(checkResult);
      }

      if (!checkResult) {
        // A negative maxRetries value will retry indefinitely.
        if (maxRetries >= 0 && retryCount > maxRetries) {
          log("giving up after %d attempts", retryCount);
          return Promise.reject(new Error(`gave up waiting for ${resourceId} after ${retryCount} attempts`));
        }

        // Try again after a delay.
        log("waiting for %d msec", pollingInterval);
        return new Promise((resolve) => {
          setTimeout(() => {
            log("trying again");
            resolve(waitForResource.call(this, resourceId, check, retryCount + 1, maxRetries));
          }, pollingInterval);
        });
      } else {
        return resource;
      }
    })
    .catch((err) => {
      if (err.name !== "TDXApiError") {
        return Promise.reject(err);
      } else {
        try {
          const parseError = JSON.parse(err.message);
          const failure = JSON.parse(parseError.failure);
          if (failure.code === "NotFoundError" || failure.code === "UnauthorizedError") {
            // Ignore resource not found and not authorized errors here, they are probably caused by
            // waiting for the projections to catch up (esp. in debug environments) by falling through
            // we will still be limited by the retry count, so won't loop forever.
            log("ignoring error %s", err.message);
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(waitForResource.call(this, resourceId, check, retryCount + 1, maxRetries));
              }, pollingInterval);
            });
          } else {
            // All other errors are fatal.
            return Promise.reject(err);
          }
        } catch (parseEx) {
          // Failed to parse TDX error - re-throw the original error.
          log("failure: [%s]", parseEx.message);
          return Promise.reject(err);
        }
      }
    });
};

const waitForIndex = function(datasetId, status, maxRetries) {
  const log = debug("nqm-api-tdx:waitForIndex");

  // The argument maxRetries is optional.
  if (typeof maxRetries === "undefined") {
    maxRetries = waitInfinitely;
  }
  status = status || "built";

  let initialStatus = "";

  const builtIndexCheck = function(dataset, retryCount) {
    log("builtIndexCheck: %s", dataset ? dataset.indexStatus : "no dataset");

    let continueWaiting;

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
          continueWaiting = new Error(`index still in error status after ${retryCount} retries`);
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

  return waitForResource.call(this, datasetId, builtIndexCheck, 0, maxRetries);
};

export {
  buildCommandRequest,
  buildQueryRequest,
  checkResponse,
  handleError,
  setDefaults,
  TDXApiError,
  waitForIndex,
};
