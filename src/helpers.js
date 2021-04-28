import crossFetch from "cross-fetch";
import debug from "debug";
import TDXApiError from "./api-tdx-error.js";

// Default 'debug' module output to STDOUT rather than STDERR.
debug.log = console.log.bind(console); // eslint-disable-line no-console

const fetch = typeof window !== "undefined" && window.fetch ? window.fetch : crossFetch;
const FetchRequest = fetch.Request || Request;
const FetchHeaders = fetch.Headers || Headers;
const pollingRetries = 15;
const pollingInterval = 1000;
const waitInfinitely = -1;

const fetchWithDeadline = function (request) {
  const log = debug("nqm-api-tdx:fetchWithDeadline");

  //
  // Implement a timeout. We have to do this manually pending a native fix
  // on fetch() - see https://github.com/whatwg/fetch/issues/20).
  //
  return new Promise((resolve, reject) => {
    let deadline;
    let rejected = false;

    if (this.config.networkTimeout) {
      // Reject the promise if the timeout expires.
      deadline = setTimeout(() => {
        log("deadline expired after %d ms", this.config.networkTimeout);
        deadline = 0;
        rejected = true;
        reject(new Error(`deadline expired after ${this.config.networkTimeout} ms`));
      }, this.config.networkTimeout);
    } else {
      // Never timeout.
      deadline = 0;
    }

    const clearTimer = () => {
      // Cancel pending deadline.
      if (deadline) {
        clearTimeout(deadline);
        deadline = 0;
      }
    };

    Promise.resolve(fetch(request))
      .then((response) => {
        clearTimer();
        // Forward response.
        resolve(response);
      })
      .catch((err) => {
        clearTimer();
        if (!rejected) {
          reject(err);
        } else {
          log("already rejected by timeout, ignoring rejection [%s]", err.message);
        }
      });
  });
};

/**
 * Formats a TDXApiError object.
 * @param  {string} source - The source of the error, usually a function name.
 * @param  {object} failure - The error details, in the form `{code: xxx, message: yyy}`
 * @param  {string} code - The error code, usually the response status code, e.g. 422, 401 etc.
 * @returns {TDXApiError}
 */
const handleError = function (code, failure, source) {
  return new TDXApiError(typeof code === "undefined" ? "n/a" : code, failure, source, new Error().stack);
};

const buildAuthenticateRequest = function (credentials, ip, ttl) {
  // We can get a token from any of the TDX services - use the first one we find to build a fetch Request.
  const uri = `${this.config.tdxServer || this.config.commandServer || this.config.queryServer}/token`;
  return new FetchRequest(uri, {
    method: "POST",
    mode: "cors",
    headers: new FetchHeaders({
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({grant_type: "client_credentials", ip, ttl: ttl || this.config.accessTokenTTL || 3600}),
  });
};

/**
 * Builds a Request object for the given command bound to the TDX command service.
 * @param  {string} command - the target TDX command, e.g. "resource/create"
 * @param  {object} data - the command payload
 * @param  {string} [contentType=application/json] - the content type
 * @param  {boolean} [noSync=false] - send command asynchronously
 */
const buildCommandRequest = function (command, data, contentType, async) {
  const commandMode = async ? "command" : "commandSync";
  contentType = contentType || "application/json";
  return new FetchRequest(`${this.config.commandServer}/${commandMode}/${command}`, {
    method: "POST",
    mode: "cors",
    headers: new FetchHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": contentType,
    }),
    body: JSON.stringify(data),
  });
};

/**
 * Builds a Request object for the given command bound to the TDX databot service.
 * @param  {string} command - the target TDX command, e.g. "register"
 * @param  {object} data - the command payload
 * @param  {string} [contentType=application/json] - the content type
 */
const buildDatabotHostRequest = function (command, data) {
  if (!this.config.databotServer) {
    throw new Error("databotServer URL not defined in API config");
  }

  return new FetchRequest(`${this.config.databotServer}/host/${command}`, {
    method: "POST",
    mode: "cors",
    headers: new FetchHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  });
};

const buildFileUploadRequest = function (resourceId, compressed, base64Encoded, file) {
  let endPoint;
  if (compressed) {
    endPoint = "compressedUpload";
  } else if (base64Encoded) {
    endPoint = "base64Upload";
  } else {
    endPoint = "upload";
  }

  return new FetchRequest(`${this.config.commandServer}/commandSync/resource/${resourceId}/${endPoint}`, {
    method: "POST",
    mode: "cors",
    headers: new FetchHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Length": file.size,
      "Content-Disposition": `attachment; filename="${file.name}"`,
    }),
    body: file,
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
const buildQueryRequest = function (endpoint, filter, projection, options) {
  filter = filter ? encodeURIComponent(JSON.stringify(filter)) : "";
  projection = projection ? encodeURIComponent(JSON.stringify(projection)) : "";
  options = options ? encodeURIComponent(JSON.stringify(options)) : "";
  let query;
  if (endpoint.indexOf("?") < 0) {
    // There is no query portion in the prefix - add one now.
    query = `${endpoint}?filter=${filter}&proj=${projection}&opts=${options}`;
  } else {
    // There is already a query portion, so append the params.
    query = `${endpoint}&filter=${filter}&proj=${projection}&opts=${options}`;
  }
  return new FetchRequest(`${this.config.queryServer}${query}`, {
    method: "GET",
    mode: "cors",
    headers: new FetchHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    }),
  });
};

/**
 * Builds a Request object for the given databot instance query bound to the TDX databot server.
 * @param  {string} endpoint - the databot query endpoint, e.g. "status/jDduieG7"
 */
const buildDatabotInstanceRequest = function (endpoint) {
  if (!this.config.databotServer) {
    throw new Error("databotServer URL not defined in API config");
  }

  return new FetchRequest(`${this.config.databotServer}/instance/${endpoint}`, {
    method: "GET",
    mode: "cors",
    headers: new FetchHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    }),
  });
};

const checkResponse = function (source, doNotThrow, response) {
  const log = debug("nqm-api-tdx:checkResponse");

  // If doNotThrow is omitted default to the config value (which defaults to `false`, i.e. errors will be thrown).
  if (typeof doNotThrow === "object") {
    response = doNotThrow;
    doNotThrow = !!this.config.doNotThrow;
  }

  return response.text().then((text) => {
    let jsonResponse;

    try {
      // Attempt to parse JSON, we could check the content-type header first?
      jsonResponse = JSON.parse(text);
    } catch (parseError) {
      log("failed to parse json => assuming non-JSON content type");
    }

    if (response.ok) {
      if (jsonResponse) {
        // Successfully parsed JSON content.
        // Check for data write errors. These differ from straight-forward invalid argument or validation
        // failures. For example, a call to `updateData` might include requests to update 10 documents.
        // If all 10 documents pass validation, the TDX will go ahead and attempt to write the data and
        // will continue to apply updates even after one of them fails, i.e. the first 4 updates succeed,
        // the fifth fails and the rest succeed. In this case `tdxResponse` will contain a `result` object with
        // details of the failures in an `error` array property and the successes in an `commit` property.
        if (!doNotThrow && jsonResponse.result && jsonResponse.result.errors && jsonResponse.result.errors.length) {
          // Reject errors with 409 Conflict status.
          return Promise.reject(
            handleError(
              409,
              {
                code: "DataError",
                message: jsonResponse.result.errors.join(", "),
              },
              source
            )
          );
        } else {
          // Either there are no errors or doNoThrow is set (in which case the callee must check `result.errors`).
          // Do nothing, fall-through and return JSON response.
        }
        return jsonResponse;
      } else {
        // Response is OK but isn't in JSON format - this is usually for text content, e.g.new-line delimited JSON,
        // markdown, html etc...
        return text;
      }
    } else {
      // Response has a non-200 status => see if the error is in JSON format.
      if (jsonResponse && jsonResponse.error) {
        // Build a failure object from the json response.
        const failure = {code: jsonResponse.error, message: jsonResponse.error_description};
        return Promise.reject(handleError(response.status, failure, source));
      } else {
        // The response body holds the error details.
        return Promise.reject(handleError(response.status, jsonResponse || text, source));
      }
    }
  });
};

const setDefaults = function (config) {
  const log = debug("nqm-api-tdx:setDefaults");

  // Legacy config support.
  config.tdxServer = config.tdxServer || config.tdxHost;
  config.commandServer = config.commandServer || config.commandHost;
  config.databotServer = config.databotServer || config.databotHost;
  config.queryServer = config.queryServer || config.queryHost;

  if (config.tdxServer && (!config.queryServer || !config.commandServer)) {
    // If the query and command configurations are omitted attempt to derive them
    // from the auth server (tdxServer) configuration.
    const protocolComponents = config.tdxServer.split("://");
    if (protocolComponents.length !== 2) {
      throw new Error(`invalid tdxServer in config - no protocol: ${config.tdxServer}`);
    }
    const protocol = protocolComponents[0];
    const hostComponents = protocolComponents[1].split(".");

    let hostname;
    if (hostComponents.length === 2) {
      // The auth server is not running under a subdomain (i.e. it is at the root).
      hostname = hostComponents.join(".");
    } else if (hostComponents.length === 3) {
      // The auth server is running on a subdomain => strip it from the hostname.
      hostname = hostComponents.slice(1).join(".");
    } else {
      throw new Error(`invalid tdxServer in config - expected 'domain.tld' or 'sub.domain.tld': ${config.tdxServer}`);
    }
    config.databotServer = config.databotServer || `${protocol}://databot.${hostname}`;
    config.commandServer = config.commandServer || `${protocol}://cmd.${hostname}`;
    config.queryServer = config.queryServer || `${protocol}://q.${hostname}`;
  }

  // Append version qualifier to query path.
  config.queryServer = config.queryServer && `${config.queryServer}/v1/`;

  log(
    "using hosts: command %s, databot %s, query %s, auth %s",
    config.commandServer || "[n/a]",
    config.databotServer || "[n/a]",
    config.queryServer || "[n/a]",
    config.tdxServer || "[n/a]"
  );

  // Default network timeout to 2 mins.
  config.networkTimeout = config.networkTimeout === undefined ? 120000 : config.networkTimeout;
};

const waitForResource = function (resourceId, check, retryCount, maxRetries) {
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
          // Restify error code had the 'Error' suffix removed post v3.x
          if (
            failure.code === "NotFound" ||
            failure.code === "NotFoundError" ||
            failure.code === "Unauthorized" ||
            failure.code === "UnauthorizedError"
          ) {
            // Ignore resource not found and not authorized errors here, they are probably caused by
            // waiting for the projections to catch up (esp. in debug environments). By falling through
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

const waitForIndex = function (datasetId, status, maxRetries) {
  const log = debug("nqm-api-tdx:waitForIndex");

  // The argument maxRetries is optional.
  if (typeof maxRetries === "undefined") {
    maxRetries = waitInfinitely;
  }

  status = status || "built";

  let initialStatus = "";

  const builtIndexCheck = function (dataset, retryCount) {
    log("builtIndexCheck: %s", dataset ? dataset.indexStatus : "no dataset");

    let stopWaiting;

    if (dataset && dataset.schemaDefinition && dataset.schemaDefinition.basedOn[0] !== "dataset") {
      // No need to wait for the index on non-dataset resources.
      stopWaiting = true;
    } else if (dataset && dataset.indexStatus === "error") {
      // Handle "error" index status.
      if (!initialStatus) {
        // Haven't got an initial status yet, so can't make a judgment as to whether or not the error status
        // is new, or the index was already in an error state.
        stopWaiting = false;
      } else if (initialStatus !== "error") {
        // The index status has transitioned from non-error to error => abort
        stopWaiting = new Error("index entered error status");
      } else {
        // The index status started as an error and is still an error => allow a limited number of retries
        // irrespective of the requested maxRetries.
        if (retryCount > Math.min(maxRetries, pollingRetries)) {
          stopWaiting = new Error(`index still in error status after ${retryCount} retries`);
        } else {
          stopWaiting = false;
        }
      }
    } else {
      stopWaiting = !!dataset && dataset.indexStatus === status;
    }

    // Cache the first index status we see.
    if (dataset && !initialStatus) {
      initialStatus = dataset.indexStatus;
    }

    return stopWaiting;
  };

  return waitForResource.call(this, datasetId, builtIndexCheck, 0, maxRetries);
};

const waitForAccount = function (accountId, verified, approved, retryCount, maxRetries) {
  const log = debug("nqm-api-tdx:waitForAccount");
  retryCount = retryCount || 0;
  return this.getAccount(accountId)
    .then((account) => {
      let retry = false;
      if (account && account.initialised) {
        // Account exists and is initialised.
        if (verified && !account.verified) {
          // If verification is required, wait for account to be verified.
          retry = true;
        } else if (approved && !account.approved) {
          // If approval is required, wait for account to be approved
          retry = true;
        } else {
          retry = false;
        }
      } else {
        // Account doesn't exist yet, or it exists but hasn't been initialised properly by the TDX.
        retry = true;
      }

      if (retry) {
        // A negative maxRetries value will retry indefinitely.
        if (maxRetries >= 0 && retryCount > maxRetries) {
          log("giving up after %d attempts", retryCount);
          return Promise.reject(new Error(`gave up waiting for account ${accountId} after ${retryCount} attempts`));
        }

        // Try again after a delay.
        log("waiting for %d msec", pollingInterval);
        return new Promise((resolve) => {
          setTimeout(() => {
            log("trying again");
            resolve(waitForAccount.call(this, accountId, verified, approved, retryCount + 1, maxRetries));
          }, pollingInterval);
        });
      } else {
        return account;
      }
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

export {
  buildAuthenticateRequest,
  buildCommandRequest,
  buildDatabotHostRequest,
  buildDatabotInstanceRequest,
  buildFileUploadRequest,
  buildQueryRequest,
  checkResponse,
  fetchWithDeadline,
  handleError,
  setDefaults,
  waitForAccount,
  waitForIndex,
};
