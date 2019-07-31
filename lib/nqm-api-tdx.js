(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("debug"), require("@nqminds/nqm-core-utils"), require("base-64"), require("cross-fetch"));
	else if(typeof define === 'function' && define.amd)
		define("nqm-api-tdx", ["debug", "@nqminds/nqm-core-utils", "base-64", "cross-fetch"], factory);
	else if(typeof exports === 'object')
		exports["nqm-api-tdx"] = factory(require("debug"), require("@nqminds/nqm-core-utils"), require("base-64"), require("cross-fetch"));
	else
		root["nqm-api-tdx"] = factory(root["debug"], root["@nqminds/nqm-core-utils"], root["base-64"], root["cross-fetch"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_5__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return buildAuthenticateRequest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return buildCommandRequest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return buildDatabotHostRequest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return buildDatabotInstanceRequest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return buildFileUploadRequest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return buildQueryRequest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return checkResponse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return fetchWithDeadline; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return handleError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return setDefaults; });
/* unused harmony export TDXApiError */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return waitForAccount; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return waitForIndex; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_cross_fetch__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_cross_fetch___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_cross_fetch__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_debug__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_debug___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_debug__);

 // Default 'debug' module output to STDOUT rather than STDERR.

__WEBPACK_IMPORTED_MODULE_1_debug___default.a.log = console.log.bind(console); // eslint-disable-line no-console

const fetch = typeof window !== "undefined" && window.fetch ? window.fetch : __WEBPACK_IMPORTED_MODULE_0_cross_fetch___default.a;
const FetchRequest = fetch.Request || Request;
const FetchHeaders = fetch.Headers || Headers;
const pollingRetries = 15;
const pollingInterval = 1000;
const waitInfinitely = -1;

const fetchWithDeadline = function (request) {
  const log = __WEBPACK_IMPORTED_MODULE_1_debug___default()("nqm-api-tdx:fetchWithDeadline"); //
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

    Promise.resolve(fetch(request)).then(response => {
      clearTimer(); // Forward response.

      resolve(response);
    }).catch(err => {
      clearTimer();

      if (!rejected) {
        reject(err);
      } else {
        log("already rejected by timeout, ignoring rejection [%s]", err.message);
      }
    });
  });
};

const TDXApiError = function (code, failure, source, stack) {
  // Build a string summary for legacy or non-json clients.
  const stringVersion = JSON.stringify({
    from: source,
    failure: JSON.stringify(failure),
    code
  });
  this.name = "TDXApiError";
  this.code = code;
  this.message = stringVersion;
  this.failure = failure;
  this.from = source;
  this.stack = stack || new Error().stack;
};

TDXApiError.prototype = Object.create(Error.prototype);
TDXApiError.prototype.constructor = TDXApiError;
/**
 * Formats a TDXApiError object.
 * @param  {string} source - The source of the error, usually a function name.
 * @param  {object} failure - The error details, in the form `{code: xxx, message: yyy}`
 * @param  {string} code - The error code, usually the response status code, e.g. 422, 401 etc.
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
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({
      grant_type: "client_credentials",
      ip,
      ttl: ttl || this.config.accessTokenTTL || 3600
    })
  });
};
/**
 * Builds a Request object for the given command bound to the TDX command service.
 * @param  {string} command - the target TDX command, e.g. "resource/create"
 * @param  {object} data - the command payload
 * @param  {string} [contentType=application/json] - the content type
 * @param  {bool} [noSync=false] - send command asynchronously
 */


const buildCommandRequest = function (command, data, contentType, async) {
  const commandMode = async ? "command" : "commandSync";
  contentType = contentType || "application/json";
  return new FetchRequest(`${this.config.commandServer}/${commandMode}/${command}`, {
    method: "POST",
    mode: "cors",
    headers: new FetchHeaders({
      "Authorization": `Bearer ${this.accessToken}`,
      "Content-Type": contentType
    }),
    body: JSON.stringify(data)
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
      "Authorization": `Bearer ${this.accessToken}`,
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
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
      "Authorization": `Bearer ${this.accessToken}`,
      "Content-Length": file.size,
      "Content-Disposition": `attachment; filename="${file.name}"`
    }),
    body: file
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
      "Authorization": `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Expires": "0"
    })
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
      "Authorization": `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Expires": "0"
    })
  });
};

const checkResponse = function (source, doNotThrow, response) {
  const log = __WEBPACK_IMPORTED_MODULE_1_debug___default()("nqm-api-tdx:checkResponse"); // If doNotThrow is omitted default to the config value (which defaults to `false`, i.e. errors will be thrown).

  if (typeof doNotThrow === "object") {
    response = doNotThrow;
    doNotThrow = !!this.config.doNotThrow;
  }

  return response.text().then(text => {
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
          return Promise.reject(handleError(409, {
            code: "DataError",
            message: jsonResponse.result.errors.join(", ")
          }, source));
        } else {// Either there are no errors or doNoThrow is set (in which case the callee must check `result.errors`).
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
        const failure = {
          code: jsonResponse.error,
          message: jsonResponse.error_description
        };
        return Promise.reject(handleError(response.status, failure, source));
      } else {
        // The response body holds the error details.
        return Promise.reject(handleError(response.status, jsonResponse || text, source));
      }
    }
  });
};

const setDefaults = function (config) {
  const log = __WEBPACK_IMPORTED_MODULE_1_debug___default()("nqm-api-tdx:setDefaults"); // Legacy config support.

  config.tdxServer = config.tdxServer || config.tdxHost;
  config.commandServer = config.commandServer || config.commandHost;
  config.databotServer = config.databotServer || config.databotHost;
  config.queryServer = config.queryServer || config.queryHost;

  if (config.tdxServer && (!config.queryServer || !config.commandServer)) {
    const protocolComponents = config.tdxServer.split("://");

    if (protocolComponents.length !== 2) {
      throw new Error(`invalid tdxServer in config - no protocol: ${config.tdxServer}`);
    }

    const protocol = protocolComponents[0];
    const hostComponents = protocolComponents[1].split(".");

    if (hostComponents.length < 3) {
      throw new Error(`invalid tdxServer in config - expected sub.domain.tld: ${config.tdxServer}`);
    }

    const hostname = hostComponents.slice(1).join(".");
    config.databotServer = config.databotServer || `${protocol}://databot.${hostname}`;
    config.commandServer = config.commandServer || `${protocol}://cmd.${hostname}`;
    config.queryServer = config.queryServer || `${protocol}://q.${hostname}`;
  } // Append version qualifier to query path.


  config.queryServer = config.queryServer && `${config.queryServer}/v1/`;
  log("using hosts: command %s, databot %s, query %s, auth %s", config.commandServer || "[n/a]", config.databotServer || "[n/a]", config.queryServer || "[n/a]", config.tdxServer || "[n/a]"); // Default network timeout to 2 mins.

  config.networkTimeout = config.networkTimeout === undefined ? 120000 : config.networkTimeout;
};

const waitForResource = function (resourceId, check, retryCount, maxRetries) {
  const log = __WEBPACK_IMPORTED_MODULE_1_debug___default()("nqm-api-tdx:waitForResource");
  retryCount = retryCount || 0;
  return this.getResource(resourceId).then(resource => {
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
      } // Try again after a delay.


      log("waiting for %d msec", pollingInterval);
      return new Promise(resolve => {
        setTimeout(() => {
          log("trying again");
          resolve(waitForResource.call(this, resourceId, check, retryCount + 1, maxRetries));
        }, pollingInterval);
      });
    } else {
      return resource;
    }
  }).catch(err => {
    if (err.name !== "TDXApiError") {
      return Promise.reject(err);
    } else {
      try {
        const parseError = JSON.parse(err.message);
        const failure = JSON.parse(parseError.failure); // Restify error code had the 'Error' suffix removed post v3.x

        if (failure.code === "NotFound" || failure.code === "NotFoundError" || failure.code === "Unauthorized" || failure.code === "UnauthorizedError") {
          // Ignore resource not found and not authorized errors here, they are probably caused by
          // waiting for the projections to catch up (esp. in debug environments). By falling through
          // we will still be limited by the retry count, so won't loop forever.
          log("ignoring error %s", err.message);
          return new Promise(resolve => {
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
  const log = __WEBPACK_IMPORTED_MODULE_1_debug___default()("nqm-api-tdx:waitForIndex"); // The argument maxRetries is optional.

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
    } // Cache the first index status we see.


    if (dataset && !initialStatus) {
      initialStatus = dataset.indexStatus;
    }

    return stopWaiting;
  };

  return waitForResource.call(this, datasetId, builtIndexCheck, 0, maxRetries);
};

const waitForAccount = function (accountId, verified, approved, retryCount, maxRetries) {
  const log = __WEBPACK_IMPORTED_MODULE_1_debug___default()("nqm-api-tdx:waitForAccount");
  retryCount = retryCount || 0;
  return this.getAccount(accountId).then(account => {
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
      } // Try again after a delay.


      log("waiting for %d msec", pollingInterval);
      return new Promise(resolve => {
        setTimeout(() => {
          log("trying again");
          resolve(waitForAccount.call(this, accountId, verified, approved, retryCount + 1, maxRetries));
        }, pollingInterval);
      });
    } else {
      return account;
    }
  }).catch(err => {
    return Promise.reject(err);
  });
};



/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_base_64__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_base_64___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_base_64__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_debug__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_debug___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_debug__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__nqminds_nqm_core_utils__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__nqminds_nqm_core_utils___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__nqminds_nqm_core_utils__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__helpers__ = __webpack_require__(1);



 // Default 'debug' module output to STDOUT rather than STDERR.

__WEBPACK_IMPORTED_MODULE_1_debug___default.a.log = console.log.bind(console); // eslint-disable-line no-console

const log = __WEBPACK_IMPORTED_MODULE_1_debug___default()("nqm-api-tdx");
const errLog = __WEBPACK_IMPORTED_MODULE_1_debug___default()("nqm-api-tdx:error");
/**
 * @typedef  {Error} TDXApiError
 * The TDX api supplies detailed error information depending on the context of the call.
 * In some instances, e.g. attempting to retrieve a resource that does not exist, the
 * error will be a simple `NotFound` string message. In other cases, e.g. attempting
 * to update 100 documents in a single call, the error will supply details for each
 * document update that failed, such as the primary key of the document and the reason
 * for the failure.
 * @property  {string} name - "TDXApiError", indicating the error originated from this library.
 * @property  {number} code - The HTTP response status code, e.g. 401
 * @property  {string} message - *Deprecated* - A string-encoded form of the error, essentially a JSON stringified
 * copy of the entire error object. This is included for legacy reasons and may be removed in a future release.
 * @property  {string} from - Usually the name of the API call that originated the error, e.g. updateData
 * @property  {string} stack - the stack trace
 * @property  {object} failure - an object containing the error information as received from the TDX
 * @property  {string} failure.code - the TDX short error code, e.g. NotFound, PermissionDenied etc.
 * @property  {string|array} failure.message - details of the failure. For simple cases this will be a string,
 * e.g. `resource not found: KDiEI3k_`. In other instance this will be an array of objects describing each error. See
 * the example below showing a failed attempt to update 2 documents. One of the errors is a simple document not found
 * and the other is a validation error giving details of the exact path in the document that failed validation.
 * @example <caption>`failure` for simple query error</caption>
 * failure: {
 *  code: "NotFound",
 *  message: "resource not found: KDiEI3k_"
 * }
 * @example <caption>`failure` for complex data update error</caption>
 * failure: {
 *  code: "BadRequestError",
 *  message: [
 *    {
 *      key: {id: "foo"},
 *      error: {
 *        message: "document not found matching key 'foo'"
 *      }
 *    },
 *    {
 *      key: {id: "bar"},
 *      error: {
 *        message: "'hello' is not a valid enum value",
 *        name: "ValidatorError",
 *        kind: "enum"
 *        path: "value"
 *      }
 *    }
 *  ]
 * }
 */

/**
 * @typedef  {object} CommandResult
 * @property  {string} commandId - The auto-generated unique id of the command.
 * @property  {object|string} response - The response of the command. If a command is sent asynchronously, this will
 * simply be the string `"ack"`. In synchronous mode, this will usually be an object consisting of the primary key
 * of the data that was affected by the command.
 * @property  {object} result - Contains success flag and detailed error information when available.
 * @property  {array} result.errors - Will contain error information when appropriate.
 * @property  {array} result.ok - Contains details of each successfully commited document.
 */

/**
 * @typedef  {object} DatasetData
 * @property  {object} metaData - The dataset metadata (see `nqmMeta` option in `getDatasetData`).
 * @property  {string} metaDataUrl - The URL to the dataset metadata (see `nqmMeta` option in `getDatasetData`.
 * @property  {object[]} data - The dataset documents.
 */

/**
 * @typedef  {object} Resource
 * @property  {string} description
 * @property  {string} id
 * @property  {string} name
 * @property  {string[]} parents
 * @property  {object} schemaDefinition
 * @property  {string[]} tags
 */

/**
 * @typedef  {object} ResourceAccess
 * @property  {string} aid - account id that is the subject of this access
 * @property  {string} by - comma-delimited list of attribution for this access
 * @property  {string} rid - resource id to which this access refers
 * @property  {string} grp - indicates the share mode (user groups only)
 * @property  {string} own - account that owns the resource
 * @property  {string[]} par - the parent(s) of the resource
 * @property  {string} typ - the base type of the resource
 * @property  {string[]} r - array of resource ids that are the source of read access (e.g. parent)
 * @property  {string[]} w - array of resource ids that are the source of write access
 */

/**
 * @typedef  {object} Zone
 * @property  {string} accountType
 * @property  {string} displayName
 * @property  {string} username
 */

class TDXApi {
  /**
   * Create a TDXApi instance
   * @param  {object} config - the TDX configuration for the remote TDX
   * @param  {string} [config.tdxServer] - the URL of the TDX auth server, e.g. https://tdx.nqminds.com. Usually this
   * is the only host parameter needed, as long as the target TDX conforms to the standard service naming conventions
   * e.g. https://[service].[tdx-domain].com. In this case the individual service hosts can be derived from the tdxHost
   * name. Optionally, you can specify each individual service host (see below). Note you only need to provide the host
   * for services you intend to use. For example, if you only need query services, just provide the query host.
   * @param  {string} [config.commandServer] - the URL of the TDX command service, e.g. https://cmd.nqminds.com
   * @param  {string} [config.queryServer] - the URL of the TDX query service, e.g. https://q.nqminds.com
   * @param  {string} [config.databotServer] - the URL of the TDX databot service, e.g. https://databot.nqminds.com
   * @param  {string} [config.accessToken] - an access token that will be used to authorise commands and queries.
   * Alternatively you can use the authenticate method to acquire a token.
   * @param  {number} [config.accessTokenTTL] - the TTL in seconds of the access token created when authenticating.
   * @param  {bool} [config.doNotThrow] - set to prevent throwing response errors. They will be returned in the
   * {@link CommandResult} object. This was set by default prior to 0.5.x
   * @example <caption>standard usage</caption>
   * import TDXApi from "nqm-api-tdx";
   * const api = new TDXApi({tdxServer: "https://tdx.acme.com"});
   */
  constructor(config) {
    this.config = Object.assign({}, config);
    this.accessToken = config.accessToken || config.authToken || "";
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__helpers__["a" /* setDefaults */])(this.config);
  }
  /**
   * Authenticates with the TDX, acquiring an authorisation token.
   * @param  {string} id - the account id, or a pre-formed credentials string, e.g. "DKJG8dfg:letmein"
   * @param  {string} secret - the account secret
   * @param  {number} [ttl=3600] - the Time-To-Live of the token in seconds, default is 1 hour. Will default to
   * config.accessTokenTTL if not given here.
   * @return  {string} The access token.
   * @exception Will throw if credentials are invalid or there is a network error contacting the TDX.
   * @example <caption>authenticate using a share key and secret</caption>
   * tdxApi.authenticate("DKJG8dfg", "letmein");
   * @example <caption>authenticate using custom ttl of 2 hours</caption>
   * tdxApi.authenticate("DKJG8dfg", "letmein", 7200);
   */


  authenticate(id, secret, ttl, ip) {
    let credentials;

    if (typeof secret !== "string") {
      // Assume the first argument is a pre-formed credentials string
      credentials = id;
      ip = ttl;
      ttl = secret;
    } else {
      // uri-encode the username and concatenate with secret.
      credentials = `${encodeURIComponent(id)}:${secret}`;
    } // Authorization headers must be base-64 encoded.


    credentials = __WEBPACK_IMPORTED_MODULE_0_base_64___default.a.encode(credentials);
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["b" /* buildAuthenticateRequest */].call(this, credentials, ip, ttl);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "authenticate")).then(result => {
      log(result);
      this.accessToken = result.access_token;
      return this.accessToken;
    }).catch(err => {
      errLog(`authenticate error: ${err.message}`);
      return Promise.reject(err);
    });
  }
  /*
   *
   *  ACCOUNT COMMANDS
   *
   */

  /**
   * Adds an account to the TDX. An account can be an e-mail based user account, a share key (token) account,
   * a databot host, an application, or an account-set (user group).
   * @param  {object} options - new account options
   * @param  {string} options.accountType - the type of account, one of ["user", "token"]
   * @param  {bool} [options.approved] - account is pre-approved (reserved for system use only)
   * @param  {string} [options.authService] - the authentication type, one of ["local", "oauth:google",
   * "oauth:github"]. Required for user-based accounts. Ignored for non-user accounts.
   * @param  {string} [options.displayName] - the human-friendly display name of the account, e.g. "Toby's share key"
   * @param  {number} [options.expires] - a timestamp at which the account expires and will no longer be granted a
   * token
   * @param  {string} [options.key] - the account secret. Required for all but oauth-based account types.
   * @param  {string} [options.owner] - the owner of the account.
   * @param  {bool} [options.scratchAccess] - indicates this account can create resources in the owners scratch
   * folder. Ignored for all accounts except share key (token) accounts. Is useful for databots that need to create
   * intermediate or temporary resources without specifying a parent resource - if no parent resource is given
   * when a resource is created and scratch access is enabled, the resource will be created in the owner's scratch
   * folder.
   * @param  {object} [options.settings] - free-form JSON object for user data.
   * @param  {string} [options.username] - the username of the new account. Required for user-based accounts, and
   * should be the account e-mail address. Can be omitted for non-user accounts, and will be auto-generated.
   * @param  {bool} [options.verified] - account is pre-verified (reserved for system use only)
   * @param  {string[]} [options.whitelist] - a list of IP addresses. Tokens will only be granted if the requesting
   * IP address is in this list
   * @param  {bool} [wait=false] - flag indicating this method will wait for the account to be fully created before
   * returning.
   * @return  {CommandResult}
   */


  addAccount(options, wait) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "account/create", options);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.addAccount: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "addAccount")).then(result => {
      if (wait) {
        return __WEBPACK_IMPORTED_MODULE_3__helpers__["f" /* waitForAccount */].call(this, options.username, options.verified, options.approved).then(() => {
          return result;
        });
      } else {
        return result;
      }
    });
  }
  /**
   * Adds the application/user connection resource. The authenticated token must belong to the application.
   * @param {string} accountId - the account id
   * @param {string} applicationId - the application id
   * @param {bool} [wait=true] - whether or not to wait for the projection to catch up.
   */


  addAccountApplicationConnection(accountId, applicationId, wait = true) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "applicationConnection/create", {
      accountId
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.addAccountApplicationConnection: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "addAccountApplicationConnection")).then(result => {
      if (wait) {
        const applicationUserId = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__nqminds_nqm_core_utils__["shortHash"])(`${applicationId}-${accountId}`);
        return __WEBPACK_IMPORTED_MODULE_3__helpers__["g" /* waitForIndex */].call(this, applicationUserId).then(() => {
          return result;
        });
      } else {
        return result;
      }
    });
  }
  /**
   * Set account approved status. Reserved for system use.
   * @param  {string} username - the full TDX identity of the account.
   * @param  {bool} approved - account approved status
   */


  approveAccount(username, approved) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "account/approve", {
      username,
      approved
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.approveAccount: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "approveAccount"));
  }
  /**
   * Delete an account
   * @param  {string} username - the full TDX identity of the account to delete.
   */


  deleteAccount(username) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "account/delete", {
      username
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.deleteAccount: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "deleteAccount"));
  }
  /**
   * Change account secret.
   * @param  {string} username - the full TDX identity of the account.
   * @param  {string} key - the new secret
   */


  resetAccount(username, key) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "account/reset", {
      username,
      key
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.resetAccount: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "resetAccount"));
  }
  /**
   * Updates account details. All update properties are optional. See createAccount for full details of
   * each option.
   * @param  {string} username - the full TDX identity of the account to update.
   * @param  {object} options - the update options
   * @param  {string} [options.displayName]
   * @param  {string} [options.key]
   * @param  {bool} [options.scratchAccess]
   * @param  {object} [options.settings]
   * @param  {string[]} [options.whitelist]
   */


  updateAccount(username, options) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "account/update", Object.assign({
      username
    }, options));
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.updateAccount: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "addAccount"));
  }
  /**
   * Set account verified status. Reserved for system use.
   * @param  {string} username - the full TDX identity of the account.
   * @param  {bool} approved - account verified status
   */


  verifyAccount(username, verified) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "account/verify", {
      username,
      verified
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.verifyAccount: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "verifyAccount"));
  }
  /*
   *
   *  RESOURCE COMMANDS
   *
   */

  /**
   * Adds a data exchange to the list of trusted exchanges known to the current TDX.
   * @param  {object} options
   * @param  {string} options.owner - the account on this TDX to which the trust relates,
   * e.g. `bob@mail.com/tdx.acme.com`
   * @param  {string} options.targetServer - the TDX to be trusted, e.g. `tdx.nqminds.com`
   * @param  {string} options.targetOwner - the account on the target TDX that is trusted,
   * e.g. `alice@mail.com/tdx.nqminds.com`.
   */


  addTrustedExchange(options) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "trustedConnection/create", options);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.addTrustedExchange: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "addTrustedExchange"));
  }
  /**
   * Adds a resource to the TDX.
   * @param  {object} options - details of the resource to be added.
   * @param  {string} [options.basedOnSchema=dataset] - the id of the schema on which this resource will be based.
   * @param  {object} [options.derived] - definition of derived filter, implying this resource is a view on an existing
   * dataset.
   * @param  {object} [options.derived.filter] - the (read) filter to apply, in mongodb query format,
   * e.g. `{"temperature": {"$gt": 15}}` will mean that only data with a temperature value greater than 15 will be
   * available in this view. The filter can be any arbitrarily complex mongodb query. Use the placeholder
   * `"@@_identity_@@"` to indicate that the identity of the currently authenticated user should be substituted.
   * For example, if the user `bob@acme.com/tdx.acme.com` is currently authenticated, a filter of `{"username":
   *  "@@_identity_@@"}` will resolve at runtime to `{"username": "bob@acme.com/tdx.acme.com"}`.
   * @param  {object} [options.derived.projection] - the (read) projection to apply, in mongodb projection format,
   * e.g. `{"timestamp": 1, "temperature": 1}` implies only the 'timestamp' and 'temperature' properties will be
   * returned.
   * @param  {string} [options.derived.source] - the id of the source dataset on which to apply the filters and
   * projections.
   * @param  {object} [options.derived.writeFilter] - the write filter to apply, in mongodb query format. This
   * controls what data can be written to the underlying source dataset. For example, a write filter of
   * `{"temperature": {"$lt": 40}}` means that attempts to write a temperature value greater than or equal to `40`
   * will fail. The filter can be any arbitrarily complex mongodb query.
   * @param  {object} [options.derived.writeProjection] - the write projection to apply, in mongodb projection format.
   * This controls what properties can be written to the underlying dataset. For example, a write projection of
   * `{"temperature": 1}` means that only the temperature field can be written, and attempts to write data to other
   * properties will fail. To allow a view to create new data in the underlying dataset, the primary key fields
   * must be included in the write projection.
   * @param  {string} [options.description] - a description for the resource.
   * @param  {string} [options.id] - the requested ID of the new resource. Must be unique. Will be auto-generated if
   * omitted (recommended).
   * @param  {string} options.name - the name of the resource. Must be unique in the parent folder.
   * @param  {object} [options.meta] - a free-form object for storing metadata associated with this resource.
   * @param  {string} [options.parentId] - the id of the parent resource. If omitted, will default to the appropriate
   * root folder based on the type of resource being created.
   * @param  {string} [options.provenance] - a description of the provenance of the resource. Markdown format is
   * supported.
   * @param  {string} [options.queryProxy] - a url or IP address that will handle all queries to this resource
   * @param  {object} [options.schema] - optional schema definition.
   * @param  {string} [options.shareMode] - the share mode assigned to the new resource. One of [`"pw"`, `"pr"`,
   * `"tr"`], corresponding to "public read/write", "public read/trusted write", "trusted only".
   * @param  {string[]} [options.tags] - a list of tags to associate with the resource.
   * @param  {string} [options.textContent] - the text content for the resource. Only applicable to text content based
   * resources.
   * @param  {bool|string} [wait=false] - indicates if the call should wait for the index to be built before it
   * returns. You can pass a string here to indicate the status you want to wait for, default is 'built'.
   * @example <caption>usage</caption>
   * // Creates a dataset resource in the authenticated users' scratch folder. The dataset stores key/value pairs
   * // where the `key` property is the primary key and the `value` property can take any JSON value.
   * tdxApi.addResource({
   *   name: "resource #1",
   *   schema: {
   *     dataSchema: {
   *       key: "string",
   *       value: {}
   *     },
   *     uniqueIndex: {key: 1}
   *   }
   * })
   */


  addResource(options, wait) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resource/create", options);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.addResource: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "addResource")).then(result => {
      if (wait) {
        return __WEBPACK_IMPORTED_MODULE_3__helpers__["g" /* waitForIndex */].call(this, result.response.id, wait === true ? "" : wait).then(() => {
          return result;
        });
      } else {
        return result;
      }
    });
  }
  /**
   * Adds read and/or write permission for an account to access a resource. Permission is required
   * equivalent to that which is being added, e.g. adding write permission requires existing
   * write access.
   * @param  {string} resourceId - The resource id
   * @param  {string} accountId - The account id to assign permission to
   * @param  {string} sourceId - The id of the resource acting as the source of the access. This
   * is usually the same as the target `resourceId`, but can also be a parent resource. For example,
   * if write access is granted with the sourceId set to be a parent, then if the permission is
   * revoked from the parent resource it will also be revoked from this resource.
   * @param  {string[]} access - The access, one or more of [`"r"`, `"w"`]. Can be an array or an individual
   * string.
   * @example <caption>add access to an account</caption>
   * tdxApi.addResourceAccess(myResourceId, "bob@acme.com/tdx.acme.com", myResourceId, ["r"]);
   */


  addResourceAccess(resourceId, accountId, sourceId, access) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resourceAccess/add", {
      rid: resourceId,
      aid: accountId,
      src: sourceId,
      acc: [].concat(access)
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.addResourceAccess: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "addResourceAccess"));
  }
  /**
   * Permanently deletes a resource.
   * @param  {string} resourceId - the id of the resource to delete. Requires write permission
   * to the resource.
   */


  deleteResource(resourceId) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resource/delete", {
      id: resourceId
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.deleteResource: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "deleteResource"));
  }
  /**
   * Permanently deletes a list of resources.
   * Will fail **all** deletes if any of the permission checks fail.
   * @param  {Resource[]} resourceList - The list of resources to delete. Note only the `id` property of each
   * resource is required.
   * @return  {CommandResult}
   */


  deleteManyResources(resourceIdList) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resource/deleteMany", {
      payload: resourceIdList
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.deleteManyResources: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "deleteManyResources"));
  }
  /**
   * Upload a file to a resource.
   * @param  {string} resourceId - The id of the destination resource.
   * @param  {object} file - The file to upload, obtained from an `<input type="file">` element.
   * @param  {bool} [stream=false] - Flag indicating whether the call should return a stream allowing
   * callees to monitor progress.
   * @param  {bool} [compressed=false] - Flag indicating the file should be decompressed after upload. ZIP format
   * only.
   * @param  {bool} [base64Encoded=false] = Flag indicating the file should be decoded from base64 after upload.
   */


  fileUpload(resourceId, file, stream, compressed = false, base64Encoded = false) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["h" /* buildFileUploadRequest */].call(this, resourceId, compressed, base64Encoded, file);
    const response = __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.fileUpload: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    });

    if (stream) {
      return response;
    } else {
      return response.then(response => {
        return [response, response.text()];
      }).then(([response, text]) => {
        if (response.ok) {
          return Promise.resolve(text);
        } else {
          return Promise.reject(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__helpers__["i" /* handleError */])(response.status, {
            code: "failure",
            message: text
          }, "fileUpload"));
        }
      });
    }
  }
  /**
   * Move resource from one folder to another. Requires write permission on the resource, the
   * source parent and the target parent resources.
   * @param  {string} id - the id of the resource to move.
   * @param  {string} fromParentId - the current parent resource to move from.
   * @param  {string} toParentId - the target folder resource to move to.
   */


  moveResource(id, fromParentId, toParentId) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resource/move", {
      id,
      fromParentId,
      toParentId
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.moveResource: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "moveResource"));
  }
  /**
   * Resets the resource index. This involves deleting existing indexes and rebuilding them. May take
   * a while depending on the size of any associated dataset and the number and complexity of indexes.
   * @param  {string} resourceId - the id of the resource, requires write permission.
   */


  rebuildResourceIndex(resourceId) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resource/index/rebuild", {
      id: resourceId
    });
    let result;
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.rebuildResourceIndex: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "rebuildIndex")).then(res => {
      result = res;
      return __WEBPACK_IMPORTED_MODULE_3__helpers__["g" /* waitForIndex */].call(this, result.response.id, "built");
    }).then(() => {
      return result;
    });
  }
  /**
   * Removes access for an account to a resource. Permission is required
   * equivalent to that which is being added, e.g. adding write permission requires existing
   * write access.
   * @param  {string} resourceId - The resource id.
   * @param  {string} accountId - The account id to remove access from.
   * @param  {string} addedBy - The account id that originally added the access, probably your
   * account id.
   * @param  {string} sourceId - The source of the access, usually the resource itself.
   * @param  {string[]} access - The access, one or more of [`"r"`, `"w"`].
   */


  removeResourceAccess(resourceId, accountId, addedBy, sourceId, access) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resourceAccess/delete", {
      rid: resourceId,
      aid: accountId,
      by: addedBy,
      src: sourceId,
      acc: access
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.removeResourceAccess: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "removeResourceAccess"));
  }
  /**
   * Set the resource import flag.
   * @param  {string} resourceId - The id of the dataset-based resource.
   * @param  {boolean} importing - Indicates the state of the import flag.
   * @return  {CommandResult}
   */


  setResourceImporting(resourceId, importing) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resource/importing", {
      id: resourceId,
      importing
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.setResourceImporting: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "setResourceImporting"));
  }
  /**
   * Set the resource schema.
   * @param  {string} resourceId - The id of the dataset-based resource.
   * @param  {object} schema - The new schema definition. TODO - document
   * @return  {CommandResult}
   */


  setResourceSchema(resourceId, schema) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resource/schema/set", {
      id: resourceId,
      schema
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.setResourceSchema: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "setResourceSchema"));
  }
  /**
   * Set the share mode for a resource.
   * @param  {string} resourceId - The resource id.
   * @param  {string} shareMode - The share mode to set, one or [`"pw"`, `"pr"`, `"tr"`] corresponding to
   * 'public read/write', 'public read, trusted write', 'trusted only'.
   */


  setResourceShareMode(resourceId, shareMode) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resource/setShareMode", {
      id: resourceId,
      shareMode
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.setResourceShareMode: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "setResourceShareMode"));
  }
  /**
   * Sets the permissive share mode of the resource. Permissive share allows anybody with acces to the resource
   * to share it with others. If a resource is not in permissive share mode, only the resource owner
   * can share it with others.
   * @param  {string} resourceId - The resource id.
   * @param  {bool} allowPermissive - The required permissive share mode.
   */


  setResourcePermissiveShare(resourceId, allowPermissive) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resource/setPermissiveShare", {
      id: resourceId,
      permissiveShare: allowPermissive ? "r" : ""
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.setResourcePermissiveShare: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "setResourcePermissiveShare"));
  }
  /**
   * Sets the dataset store of the resource. Reserved for system use.
   * @param  {string} resourceId - The resource id.
   * @param  {string} store - The name of the store.
   */


  setResourceStore(resourceId, store) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resource/store/set", {
      id: resourceId,
      store
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.setResourceStore: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "setResourceStore"));
  }
  /**
   * Set the text for a text-content based resource.
   * @param  {string} resourceId - The resource id.
   * @param  {string} textContent - The text content to set.
   * @example <caption>usage</caption>
   * // Sets the text content for a text-html resource.
   * tdxApi.setResourceTextContent(
   *   "HyeqJgVdJ7",
   *   "<html><body><p>Hello World</p></body></html>"
   * );
   */


  setResourceTextContent(resourceId, textContent) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resource/textContent/set", {
      id: resourceId,
      textContent
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.setResourceTextContent: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "setResourceTextContent"));
  }
  /**
   * Suspends the resource index. This involves deleting any existing indexes. Requires write permission. When
   * a resource index is in `suspended` status, it is not possible to run any queries or updates against
   * the resource.
   * @param  {string} resourceId - the id of the resource. Requires write permission.
   */


  suspendResourceIndex(resourceId) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resource/index/suspend", {
      id: resourceId
    });
    let result;
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.suspendResourceIndex: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "suspendIndex")).then(res => {
      result = res;
      return __WEBPACK_IMPORTED_MODULE_3__helpers__["g" /* waitForIndex */].call(this, result.response.id, "suspended");
    }).then(() => {
      return result;
    });
  }
  /**
   * Removes all data from the resource. Applicable to dataset-based resources only. This can not be
   * undone.
   * @param  {string} resourceId - The resource id to truncate.
   */


  truncateResource(resourceId) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resource/truncate", {
      id: resourceId
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.truncateResource: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "truncateResource"));
  }
  /**
   * Modify one or more of the meta data associated with the resource.
   * @param  {string} resourceId - id of the resource to update
   * @param  {object} update - object containing the properties to update. Can be one or more of those
   * listed below. See the {@link TDXApi#addResource} method for semantics and syntax of each property.
   * @param  {string} [update.derived]
   * @param  {string} [update.description]
   * @param  {object} [update.meta]
   * @param  {string} [update.name]
   * @param  {bool} [update.overwrite] - set this flag to overwrite existing data rather than merging (default). This
   * currently only applies to the `meta` property.
   * @param  {string} [update.provenance]
   * @param  {string} [update.queryProxy]
   * @param  {array} [update.tags]
   * @param  {string} [update.textContent] see also {@link TDXApi#setResourceTextContent}
   */


  updateResource(resourceId, update) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "resource/update", Object.assign({
      id: resourceId
    }, update));
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.updateResource: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "updateResource"));
  }
  /*
   *
   *  RESOURCE DATA COMMANDS
   *
   */

  /**
   * Add data to a dataset resource.
   * @param  {string} datasetId - The id of the dataset-based resource to add data to.
   * @param  {object|array} data - The data to add. Must conform to the schema defined by the resource metadata.
   * @param  {bool} [doNotThrow=false] - set to override default error handling. See {@link TDXApi}.
   * Supports creating an individual document or many documents.
   * @example <caption>create an individual document</caption>
   * // Assumes the dataset primary key is 'lsoa'
   * tdxApi.addData(myDatasetId, {lsoa: "E0000001", count: 398});
   * @example <caption>create multiple documents</caption>
   * tdxApi.addData(myDatasetId, [
   *  {lsoa: "E0000001", count: 398},
   *  {lsoa: "E0000002", count: 1775},
   *  {lsoa: "E0000005", count: 4533},
   * ]);
   */


  addData(datasetId, data, doNotThrow) {
    const postData = {
      datasetId,
      payload: [].concat(data)
    };
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "dataset/data/createMany", postData);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.addData: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "addData", doNotThrow));
  }
  /**
   * Deletes data from a dataset-based resource.
   * @param  {string} datasetId - The id of the dataset-based resource to delete data from.
   * @param  {object|array} data - The primary key data to delete.
   * @param  {bool} [doNotThrow=false] - set to override default error handling. See {@link TDXApi}.
   */


  deleteData(datasetId, data, doNotThrow) {
    const postData = {
      datasetId,
      payload: [].concat(data)
    };
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "dataset/data/deleteMany", postData);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.deleteData: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "deleteData", doNotThrow));
  }
  /**
   * Deletes data from a dataset-based resource using a query to specify the documents to be deleted.
   * @param  {string} datasetId - The id of the dataset-based resource to delete data from.
   * @param  {object} query - The query that specifies the data to delete. All documents matching the
   * query will be deleted.
   * @param  {bool} [doNotThrow=false] - set to override default error handling. See {@link TDXApi}.
   * @example
   * // Delete all documents with English lsoa.
   * tdxApi.deleteDataByQuery(myDatasetId, {lsoa: {$regex: "E*"}});
   */


  deleteDataByQuery(datasetId, query, doNotThrow) {
    const postData = {
      datasetId,
      query: JSON.stringify(query)
    };
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "dataset/data/deleteQuery", postData);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.deleteDataByQuery: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "deleteDataByQuery", doNotThrow));
  }
  /**
   * Patches data in a dataset resource. Uses the [JSON patch](https://tools.ietf.org/html/rfc6902) format,
   * which involves defining the primary key data followed by a flexible update specification.
   * @param  {string} datasetId - The id of the dataset-based resource to update.
   * @param  {object} data - The patch definition.
   * @param  {object|array} data.__update - An array of JSON patch specifications.
   * @param  {bool} [doNotThrow=false] - set to override default error handling. See {@link TDXApi}.
   * @example <caption>patch a single value in a single document</caption>
   * tdxApi.patchData(myDatasetId, {lsoa: "E000001", __update: [{path: "/count", op: "replace", value: 948}]});
   * @example <caption>patch a more than one value in a single document</caption>
   * tdxApi.patchData(myDatasetId, {lsoa: "E000001", __update: [
   *   {path: "/count", op: "replace", value: 948}
   *   {path: "/modified", op: "add", value: Date.now()}
   * ]});
   */


  patchData(datasetId, data, doNotThrow) {
    const postData = {
      datasetId,
      payload: [].concat(data)
    };
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "dataset/data/upsertMany", postData);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.patchData: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "patchData", doNotThrow));
  }
  /**
   * Updates data in a dataset resource.
   * @param  {string} datasetId - The id of the dataset-based resource to update.
   * @param  {object|array} data - The data to update. Must conform to the schema defined by the resource metadata.
   * Supports updating individual or multiple documents.
   * @param  {bool} [upsert=false] - Indicates the data should be created if no document is found matching the
   * @param  {bool} [doNotThrow=false] - set to override default error handling. See {@link TDXApi}.
   * primary key.
   * @return {CommandResult} - Use the result property to check for errors.
   * @example <caption>update an existing document</caption>
   * tdxApi.updateData(myDatasetId, {lsoa: "E000001", count: 488});
   * @example <caption>upsert a document</caption>
   * // Will create a document if no data exists matching key 'lsoa': "E000004"
   * tdxApi.updateData(myDatasetId, {lsoa: "E000004", count: 288}, true);
   */


  updateData(datasetId, data, upsert, doNotThrow) {
    const postData = {
      datasetId,
      payload: [].concat(data),
      __upsert: !!upsert
    };
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "dataset/data/updateMany", postData);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.updateData: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "updateData", doNotThrow));
  }
  /**
   * Updates data in a dataset-based resource using a query to specify the documents to be updated.
   * @param  {string} datasetId - The id of the dataset-based resource to update data in.
   * @param  {object} query - The query that specifies the data to update. All documents matching the
   * @param  {bool} [doNotThrow=false] - set to override default error handling. See {@link TDXApi}.
   * query will be updated.
   * @example
   * // Update all documents with English lsoa, setting `count` to 1000.
   * tdxApi.updateDataByQuery(myDatasetId, {lsoa: {$regex: "E*"}}, {count: 1000});
   */


  updateDataByQuery(datasetId, query, update, doNotThrow) {
    const postData = {
      datasetId,
      query: JSON.stringify(query),
      update
    };
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "dataset/data/updateQuery", postData);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.updateDataByQuery: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "updateDataByQuery", doNotThrow));
  }
  /*
   *
   *  DATABOT COMMANDS
   *
   */

  /**
   * Deletes one or more hosts, depending on the given parameters. E.g. if just a `hostId` is given, all hosts
   * will be deleted with that id. If an ip address is also given, all hosts with the id on that ip address will
   * be deleted and so on. Note that hosts can only be deleted if they are in the `offline` status.
   * @param  {object} payload - The definition of the host(s) to delete. Can be an array of objects or a single object
   * @param  {string} payload.hostId - The id of the hosts to be deleted.
   * @param  {string} [payload.hostIp] - The optional ip of the hosts to be deleted.
   * @param  {number} [payload.hostPort] - The optional port number of the host to be deleted.
   */


  deleteDatabotHost(payload) {
    const postData = {
      payload
    };
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "databot/host/delete", postData);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.deleteDatabotHost: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "deleteDatabotHost"));
  }
  /**
   * Deletes a databot instance and all output/debug data associated with it.
   * @param  {string[]} instanceId - The id(s) of the instances to delete. Can be an array of instance ids or an
   * individual string id
   */


  deleteDatabotInstance(instanceId) {
    const postData = {
      instanceId: [].concat(instanceId)
    };
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "databot/deleteInstance", postData);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.deleteDatabotInstance: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "deleteDatabotInstance"));
  }
  /**
   * Gets databot instance data for the given instance id.
   * @param  {string} instanceId - The id of the instance to retrieve.
   */


  getDatabotInstance(instanceId) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["j" /* buildDatabotInstanceRequest */].call(this, instanceId);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.getDatabotInstance: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "getDatabotInstance"));
  }
  /**
   * Get databot instance output.
   * @param  {string} instanceId - The instance id to retrieve output for.
   * @param  {string} [processId] - Optional process id. If omitted, output for all instance processes will be returned.
   */


  getDatabotInstanceOutput(instanceId, processId) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["j" /* buildDatabotInstanceRequest */].call(this, `output/${instanceId}/${processId || ""}`);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.getDatabotInstanceOutput: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "getDatabotInstanceOutput"));
  }
  /**
   * Get databot instance status.
   * @param  {string} instanceId - The id of the databot instance for which status is retrieved.
   */


  getDatabotInstanceStatus(instanceId) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["j" /* buildDatabotInstanceRequest */].call(this, `status/${instanceId}`);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.getDatabotInstanceStatus: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "getDatabotInstanceStatus"));
  }
  /**
   * Registers a databot host with the TDX. Once registered, a host is eligible to receive commands from the TDX.
   * @param  {object} payload - The databot host identifier payload.
   * @param  {number} payload.port - the port number the host is listening on.
   * @param  {string} payload.version - the databot host software version.
   * @param  {string} payload.hostStatus - the current status of the host, "idle" or "busy".
   * @param  {string} [payload.ip] - optional ip address of the host. Usually the TDX can deduce this from the incoming
   * request.
   * @example <caption>register a databot host</caption>
   * tdxApi.registerDatabotHost({version: "0.3.11", port: 2312, hostStatus: "idle"});
   */


  registerDatabotHost(payload) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["k" /* buildDatabotHostRequest */].call(this, "register", payload);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.registerDatabotHost: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "registerDatabotHost"));
  }
  /**
   * Sends a command to a databot host. Reserved for system use.
   * @param  {string} command - The command to send. Must be one of ["stopHost", "updateHost", "runInstance",
   * "stopInstance", "clearInstance"]
   * @param  {string} hostId - The id of the host.
   * @param  {string} [hostIp] - The ip address of the host. If omitted, the command will be sent to all
   * host ip addresses.
   * @param  {number} [hostPort] - The port number of the host. If omitted, the command will be sent to
   * all host ports.
   * @param  {object} [payload] - The command payload.
   */


  sendDatabotHostCommand(command, hostId, hostIp, hostPort, payload) {
    const postData = {
      hostId,
      hostIp,
      hostPort,
      command,
      payload
    };
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "databot/host/command", postData);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.sendDatabotHostCommand: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "sendDatabotHostCommand"));
  }
  /**
   * Starts a databot instance.
   * @param  {string} databotId - The id of the databot definition to start.
   * @param  {object} payload - The instance input and parameters.
   * @param  {number} [payload.authTokenTTL] - The time-to-live to use when creating the auth token, in seconds.
   * Will default to the TDX-configured default if not given (usually 1 hour).
   * @param  {number} [payload.chunks=1] - The number of processes to instantiate. Each will be given the same input
   * data, with only the chunk number varying.
   * @param  {bool} [payload.debugMode=false] - Flag indicating this instance should be run in debug mode, meaning
   * all debug output will be captured and stored on the TDX. n.b. setting this will also restrict the hosts available
   * to run the instance to those that are willing to run in debug mode.
   * @param  {string} [payload.description] - The description for this instance.
   * @param  {object} [payload.inputs] - The input data. A free-form object that should conform to the
   * specification in the associated databot definition.
   * @param  {string} [payload.name] - The name to associate with this instance, e.g. "Male population
   * projection 2017"
   * @param  {string} [payload.overwriteExisting] - The id of an existing instance that should be overwritten.
   * @param  {number} [payload.priority] - The priority to assign this instance. Reserved for system use.
   * @param  {string} payload.shareKeyId - The share key to run the databot under.
   * @param  {string} [payload.shareKeySecret] - The secret of the share key. Ignored if the share key id refers to a
   * user-based account.
   */


  startDatabotInstance(databotId, payload) {
    const postData = {
      databotId,
      instanceData: payload
    };
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "databot/startInstance", postData);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.startDatabotInstance: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "startDatabotInstance"));
  }
  /**
   * Aborts a running databot instance.
   * @param  {string} instanceId - The id of the instance to abort.
   */


  abortDatabotInstance(instanceId) {
    const postData = {
      instanceId
    };
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "databot/abortInstance", postData);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.abortDatabotInstance: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "abortDatabotInstance"));
  }
  /**
   * Terminates or pauses a running databot instance.
   * @param  {string} instanceId - The id of the instance to terminate or pause.
   * @param  {string} mode - One of [`"stop"`, `"pause"`, `"resume"`]
   */


  stopDatabotInstance(instanceId, mode) {
    const postData = {
      instanceId,
      mode
    };
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "databot/stopInstance", postData);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.stopDatabotInstance: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "stopDatabotInstance"));
  }
  /**
   * Updates a databot host status.
   *
   * n.b. the response to this request will contain any commands from the TDX that the host should action (
   * [see commands](https://github.com/nqminds/nqm-databots/tree/master/packages/nqm-databot-host#tdx-command-format)).
   * @param  {object} payload - The databot host status payload.
   * @param  {number} payload.port - The port number on which the host is listening.
   * @param  {string} payload.hostStatus - The current host status, either "idle" or "busy".
   * @param  {string} [payload.ip] - optional ip address of the host. Usually the TDX can deduce this from the incoming
   * request.
   * @example <caption>update databot host status</caption>
   * tdxApi.updateDatabotHostStatus({port: 2312, hostStatus: "idle"});
   */


  updateDatabotHostStatus(payload) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["k" /* buildDatabotHostRequest */].call(this, "status", payload);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.updateDatabotHostStatus: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "updateDatabotHostStatus"));
  }
  /**
   * Stores databot instance output on the TDX.
   * @param  {object} output - The output payload for the databot instance.
   */


  writeDatabotHostInstanceOutput(output) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["k" /* buildDatabotHostRequest */].call(this, "output", output);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.writeDatabotHostInstanceOutput: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "writeDatabotHostInstanceOutput"));
  }
  /*
   *
   *  ZONE CONNECTION COMMANDS
   *
   */

  /**
   * Adds a zone connection to a remote TDX. The details for the connection should be retrieved by a call to the
   * certificate endpoint for the TDX, e.g. https://tdx.nqminds.com/certficate.
   * @param  {object} options - The zone connection details
   * @param  {string} options.owner - The owner of the zone connection. Must be the same as the authenticated account.
   * @param  {string} options.tdxServer - The URL of the target TDX auth server, e.g. https://tdx.nqminds.com
   * @param  {string} [options.commandServer] - The URL of the target TDX command server, e.g. https://cmd.nqminds.com
   * @param  {string} [options.queryServer] - The URL of the target TDX query server, e.g. https://q.nqminds.com
   * @param  {string} [options.ddpServer] - The URL of the target TDX ddp server, e.g. https://ddp.nqminds.com
   * @param  {string} [options.databotServer] - The URL of the target TDX databot server,
   * e.g. https://databot.nqminds.com
   * @param  {string} [options.displayName] - The friendly name of the TDX.
   */


  addZoneConnection(options) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "zoneConnection/create", options);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.addZoneConnection: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "addZoneConnection"));
  }
  /**
   * Deletes a zone connection. The authenticated account must own the zone connection.
   * @param  {string} id - The id of the zone connection to delete.
   */


  deleteZoneConnection(id) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "zoneConnection/delete", {
      id
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.deleteZoneConnection: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "deleteZoneConnection"));
  }
  /**
   * AUDIT COMMANDS
   */


  rollbackCommand(id) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["e" /* buildCommandRequest */].call(this, "rollback", {
      id
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.rollbackCommand: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "rollbackCommand"));
  }
  /*
   *
   *  QUERIES
   *
   */

  /**
   * Creates a client user token (e.g. bound to the browser IP) for an application-user token bound to the
   * given IP or the currently authenticated token IP. The currently authenticated token ***must*** be an application
   * token, whereby the application has been authorised by the user and the user has permission to access the
   * application. The returned token will be bound to the given IP or the IP of the currently authenticated token
   * (i.e the application server IP).
   *
   * @param  {string} username - The users' TDX id.
   * @param  {string} [ip] - The optional IP address to bind the user token to.
   * @param  {number} [ttl] - The ttl in seconds.
   * @return  {object} - The new application-user token, bound to the given IP.
   * @example <caption>create token bound to server ip with default TDX ttl</caption>
   * tdxApi.createTDXToken("bob@bob.com/acme.tdx.com");
   * @example <caption>create for specific IP</caption>
   * tdxApi.createTDXToken("bob@bob.com/acme.tdx.com", newClientIP);
   */


  createTDXToken(username, ip, ttl) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, "token/create", {
      username,
      ip,
      ttl
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.createTDXToken: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "createTDXToken"));
  }
  /**
   * Exchanges a client user token (e.g. bound to the browser IP) for an application-user token bound to the
   * given IP or the currently authenticated token IP. The currently authenticated token ***must*** be an application
   * token, whereby the application has been authorised by the user and the user has permission to access the
   * application. The returned token will be bound to the given IP or the IP of the currently authenticated token
   * (i.e the application server IP).
   *
   * @param  {string} token - The users' TDX auth server token to validate.
   * @param  {string} [validateIP] - The optional IP address to validate the user token against.
   * @param  {string} [exchangeIP] - The optional IP address to bind the new token to.
   * @param  {number} [ttl] - The ttl in seconds.
   * @return  {object} - The new token application-user token, bound to the server IP.
   * @example <caption>validate against current IP</caption>
   * tdxApi.exchangeTDXToken(clientToken);
   * @example <caption>validate against different IP</caption>
   * tdxApi.exchangeTDXToken(clientToken, newClientIP);
   * @example <caption>validate against current IP, bind to a new IP</caption>
   * tdxApi.exchangeTDXToken(clientToken, null, serverIP);
   */


  exchangeTDXToken(token, validateIP, exchangeIP, ttl) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, "token/exchange", {
      token,
      ip: validateIP,
      exchangeIP,
      ttl
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.exchangeTDXToken: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "exchangeTDXToken"));
  }
  /**
   * Streams the contents of a resource. For dataset-based resources this will stream the dataset contents in newline
   * delimited JSON (NDJSON). For raw file resources this will stream the raw file contents (zip, raw JSON etc).
   * @param  {string} resourceId - The id of the resource to be downloaded.
   * @return {object} - Response object, where the response body is a stream object.
   */


  downloadResource(resourceId) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, `resources/${resourceId}/download`);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.downloadResource: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    });
  }
  /**
   * Gets the details for a given account id.
   * @param  {string} accountId - the id of the account to be retrieved.
   * @return  {Zone} zone
   */


  getAccount(accountId) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, "accounts", {
      username: accountId
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.getAccount: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "getAccount")).then(accountList => {
      return accountList && accountList.length ? accountList[0] : null;
    });
  }
  /**
   * Gets the details for all peer accounts.
   * @param  {object} filter - query filter.
   * @param  {string} filter.accountType - the account type to filter by, e.g. "user", "token", "host" etc.
   * @return  {Zone[]} zone
   * @example <caption>Get all databots owned by bob</caption>
   * api.getAccounts({accountType: "host", own: "bob@nqminds.com"})
   */


  getAccounts(filter) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, "accounts", filter);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.getAccounts: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "getAccounts"));
  }
  /**
   * Performs an aggregate query on the given dataset resource, returning a response object with stream in the body
   * @param  {string} datasetId - The id of the dataset-based resource to perform the aggregate query on.
   * @param  {object|string} pipeline - The aggregate pipeline, as defined in the
   * [mongodb docs](https://docs.mongodb.com/manual/aggregation/). Can be given as a JSON object or as a stringified
   * JSON object.
   * @param  {bool} [ndJSON] - If set, the data is sent in [newline delimited json format](http://ndjson.org/).
   * @return  {object} - Response object, where the response body is a stream object.
   */


  getAggregateDataStream(datasetId, pipeline, ndJSON) {
    // Convert pipeline to string if necessary.
    if (pipeline && typeof pipeline === "object") {
      pipeline = JSON.stringify(pipeline);
    }

    const endpoint = `resources/${datasetId}/${ndJSON ? "ndaggregate" : "aggregate"}?pipeline=${pipeline}`;
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, endpoint);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.getAggregateData: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    });
  }
  /**
   * Performs an aggregate query on the given dataset resource.
   * @param  {string} datasetId - The id of the dataset-based resource to perform the aggregate query on.
   * @param  {object|string} pipeline - The aggregate pipeline, as defined in the
   * [mongodb docs](https://docs.mongodb.com/manual/aggregation/). Can be given as a JSON object or as a stringified
   * JSON object.
   * @param  {bool} [ndJSON] - If set, the data is sent in [newline delimited json format](http://ndjson.org/).
   * @return  {DatasetData}
   */


  getAggregateData(datasetId, pipeline, ndJSON) {
    return this.getAggregateDataStream(datasetId, pipeline, ndJSON).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "getAggregateData"));
  }
  /**
   * Gets details of the currently authenticated account.
   * @return  {object} - Details of the authenticated account.
   */


  getAuthenticatedAccount() {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, "auth-account");
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.getAuthenticatedAccount: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "getAuthenticatedAccount"));
  }
  /**
   * Gets all data from the given dataset resource that matches the filter provided and returns a response object with
   * stream in the body.
   * @param  {string} datasetId - The id of the dataset-based resource.
   * @param  {object} [filter] - A mongodb filter object. If omitted, all data will be retrieved.
   * @param  {object} [projection] - A mongodb projection object. Should be used to restrict the payload to the
   * minimum properties needed if a lot of data is being retrieved.
   * @param  {object} [options] - A mongodb options object. Can be used to limit, skip, sort etc. Note a default
   * `limit` of 1000 is applied if none is given here.
   * @param  {bool} [options.nqmMeta] - When set, the resource metadata will be returned along with the dataset
   * data. Can be used to avoid a second call to `getResource`. Otherwise a URL to the metadata is provided.
   * @param  {bool} [ndJSON] - If set, the data is sent in [newline delimited json format](http://ndjson.org/).
   * @return  {object} - Response object, where the response body is a stream object.
   */


  getDataStream(datasetId, filter, projection, options, ndJSON) {
    const endpoint = `resources/${datasetId}/${ndJSON ? "nddata" : "data"}`;
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, endpoint, filter, projection, options);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.getDataStream: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    });
  }
  /**
   * For structured resources, e.g. datasets, this function gets all data from the given dataset resource that
   * matches the filter provided.
   *
   * For non-structured resources such as text-content or raw files etc only the `datasetId` argument is relevant
   * and this method is equivalent to `downloadResource`.
   *
   * @param  {string} datasetId - The id of the dataset-based resource.
   * @param  {object} [filter] - A mongodb filter object. If omitted, all data will be retrieved.
   * @param  {object} [projection] - A mongodb projection object. Should be used to restrict the payload to the
   * minimum properties needed if a lot of data is being retrieved.
   * @param  {object} [options] - A mongodb options object. Can be used to limit, skip, sort etc. Note a default
   * `limit` of 1000 is applied if none is given here.
   * @param  {bool} [options.nqmMeta] - When set, the resource metadata will be returned along with the dataset
   * data. Can be used to avoid a second call to `getResource`. Otherwise a URL to the metadata is provided.
   * @param  {bool} [ndJSON] - If set, the data is sent in [newline delimited json format](http://ndjson.org/).
   * @return  {DatasetData}
   */


  getData(datasetId, filter, projection, options, ndJSON) {
    return this.getDataStream(datasetId, filter, projection, options, ndJSON).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "getData"));
  }
  /**
   * Sugar for newline delimited data. See `getData` for details.
   */


  getNDData(datasetId, filter, projection, options) {
    return this.getDataStream(datasetId, filter, projection, options, true).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "getNDData"));
  }
  /**
   * @deprecated  use {@link TDXApi#getDataStream}
   * Gets all data from the given dataset resource that matches the filter provided and returns a response object with
   * stream in the body.
   * @param  {string} datasetId - The id of the dataset-based resource.
   * @param  {object} [filter] - A mongodb filter object. If omitted, all data will be retrieved.
   * @param  {object} [projection] - A mongodb projection object. Should be used to restrict the payload to the
   * minimum properties needed if a lot of data is being retrieved.
   * @param  {object} [options] - A mongodb options object. Can be used to limit, skip, sort etc. Note a default
   * `limit` of 1000 is applied if none is given here.
   * @param  {bool} [options.nqmMeta] - When set, the resource metadata will be returned along with the dataset
   * data. Can be used to avoid a second call to `getResource`. Otherwise a URL to the metadata is provided.
   * @param  {bool} [ndJSON] - If set, the data is sent in [newline delimited json format](http://ndjson.org/).
   * @return  {object} - Response object, where the response body is a stream object.
   */


  getDatasetDataStream(datasetId, filter, projection, options, ndJSON) {
    return this.getDataStream(datasetId, filter, projection, options, ndJSON);
  }
  /**
   * @deprecated  use {@link TDXApi#getData}
   * Gets all data from the given dataset resource that matches the filter provided.
   * @param  {string} datasetId - The id of the dataset-based resource.
   * @param  {object} [filter] - A mongodb filter object. If omitted, all data will be retrieved.
   * @param  {object} [projection] - A mongodb projection object. Should be used to restrict the payload to the
   * minimum properties needed if a lot of data is being retrieved.
   * @param  {object} [options] - A mongodb options object. Can be used to limit, skip, sort etc. Note a default
   * `limit` of 1000 is applied if none is given here.
   * @param  {bool} [options.nqmMeta] - When set, the resource metadata will be returned along with the dataset
   * data. Can be used to avoid a second call to `getResource`. Otherwise a URL to the metadata is provided.
   * @param  {bool} [ndJSON] - If set, the data is sent in [newline delimited json format](http://ndjson.org/).
   * @return  {DatasetData}
   */


  getDatasetData(datasetId, filter, projection, options, ndJSON) {
    return this.getData(datasetId, filter, projection, options, ndJSON);
  }
  /**
   * Gets a count of the data in a dataset-based resource, after applying the given filter.
   * @param  {string} datasetId - The id of the dataset-based resource.
   * @param  {object} [filter] - An optional mongodb filter to apply before counting the data.
   */


  getDataCount(datasetId, filter) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, `resources/${datasetId}/count`, filter);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.getDataCount: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "getDataCount"));
  }
  /**
   * @deprecated  use {@link TDXApi#getDataCount}
   * Gets a count of the data in a dataset-based resource, after applying the given filter.
   * @param  {string} datasetId - The id of the dataset-based resource.
   * @param  {object} [filter] - An optional mongodb filter to apply before counting the data.
   */


  getDatasetDataCount(datasetId, filter) {
    return this.getDataCount(datasetId, filter);
  }
  /**
   * Gets a list of distinct values for a given property in a dataset-based resource.
   * @param  {string} datasetId - The id of the dataset-based resource.
   * @param  {string} key - The name of the property to use. Can be a property path, e.g. `"address.postcode"`.
   * @param  {object} [filter] - An optional mongodb filter to apply.
   * @return  {object[]} - The distinct values.
   */


  getDistinct(datasetId, key, filter, projection, options) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, `resources/${datasetId}/distinct?key=${key}`, filter, projection, options); // eslint-disable-line max-len

    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.getDistinct: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "getDistinct"));
  }
  /**
   * Gets the details for a given resource id.
   * @param  {string} resourceId - The id of the resource to retrieve.
   * @param  {bool} [noThrow=false] - If set, the call won't reject or throw if the resource doesn't exist.
   * @return  {Resource}
   * @exception  Will throw if the resource is not found (see `noThrow` flag) or permission is denied.
   * @example
   * api.getResource(myResourceId)
   *  .then((resource) => {
   *    console.log(resource.name);
   *  });
   */


  getResource(resourceId, noThrow) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, `resources/${resourceId}`);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.getResource: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(response => {
      if (noThrow) {
        // If noThrow specified, return null if there is an error fetching the resource, rather than throwing.
        if (response.ok) {
          return response.json();
        } else if (response.status === 404) {
          return null;
        } else {
          return __WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].call(this, "getResource", response);
        }
      } else {
        return __WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].call(this, "getResource", response);
      }
    });
  }
  /**
   * Gets all access the authenticated account has to the given resource id.
   * @param  {string} resourceId - The id of the resource whose access is to be retrieved.
   * @return {ResourceAccess[]} - Array of ResourceAccess objects.
   * @example
   * api.getResourceAccess(myResourceId)
   *  .then((resourceAccess) => {
   *    console.log("length of access list: ", resourceAccess.length);
   *  });
   */


  getResourceAccess(resourceId, filter, projection, options) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, `resources/${resourceId}/access`, filter, projection, options);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.getResourceAccess: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(response => {
      return __WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].call(this, "getResourceAccess", response);
    });
  }
  /**
   * Gets all resources that are ancestors of the given resource.
   * @param  {string} resourceId - The id of the resource whose parents are to be retrieved.
   * @return  {Resource[]}
   */


  getResourceAncestors(resourceId) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, `resources/${resourceId}/ancestors`);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.getDatasetAncestors: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "getResourceAncestors"));
  }
  /**
   * Gets the details of all resources that match the given filter.
   * @param  {object} [filter] - A mongodb filter definition
   * @param  {object} [projection] - A mongodb projection definition, can be used to restrict which properties are
   * returned thereby limiting the payload.
   * @param  {object} [options] - A mongodb options definition, can be used for limit, skip, sorting etc.
   * @return  {Resource[]}
   */


  getResources(filter, projection, options) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, "resources", filter, projection, options);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.getResource: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "getResources"));
  }
  /**
   * Retrieves all resources that have an immediate ancestor of the given schema id.
   * @param  {string} schemaId - The id of the schema to match, e.g. `"geojson"`.
   * @return  {Resource[]}
   */


  getResourcesWithSchema(schemaId) {
    const filter = {
      "schemaDefinition.parent": schemaId
    };
    return this.getResources(filter);
  }
  /**
   * Retrieves an authorisation token for the given TDX instance
   * @param  {string} tdx - The TDX instance name, e.g. `"tdx.acme.com"`.
   * @return  {string}
   */


  getTDXToken(tdx) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, `tdx-token/${tdx}`);
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.getTDXToken: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "getTDXToken"));
  }
  /**
   * Gets the details for a given zone (account) id.
   * @param  {string} accountId - the id of the zone to be retrieved.
   * @return  {Zone} zone
   */


  getZone(accountId) {
    return this.getAccount(accountId);
  }
  /**
   * Determines if the given account is a member of the given group.
   * @param {string} accountId - the id of the account
   * @param {*} groupId - the id of the group
   */


  isInGroup(accountId, groupId) {
    const lookup = {
      aid: accountId,
      "r.0": {
        $exists: true
      },
      grp: "m"
    };
    return this.getResourceAccess(groupId, lookup).then(access => {
      return !!access.length;
    });
  }
  /**
   * Validates the given token was signed by this TDX, and returns the decoded token data.
   * @param  {string} token - The TDX auth server token to validate.
   * @param  {string} [ip] - The optional IP address to validate against.
   * @return  {object} - The decoded token data.
   */


  validateTDXToken(token, ip) {
    const request = __WEBPACK_IMPORTED_MODULE_3__helpers__["l" /* buildQueryRequest */].call(this, "token/validate", {
      token,
      ip
    });
    return __WEBPACK_IMPORTED_MODULE_3__helpers__["c" /* fetchWithDeadline */].call(this, request).catch(err => {
      errLog("TDXApi.validateTDXToken: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    }).then(__WEBPACK_IMPORTED_MODULE_3__helpers__["d" /* checkResponse */].bind(this, "validateTDXToken"));
  }

}
/* harmony export (immutable) */ __webpack_exports__["TDXApi"] = TDXApi;

/* harmony default export */ __webpack_exports__["default"] = (TDXApi);

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ })
/******/ ]);
});
//# sourceMappingURL=nqm-api-tdx.js.map