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
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.waitForIndex = exports.waitForAccount = exports.TDXApiError = exports.setDefaults = exports.handleError = exports.fetchWithDeadline = exports.checkResponse = exports.buildQueryRequest = exports.buildFileUploadRequest = exports.buildDatabotInstanceRequest = exports.buildDatabotHostRequest = exports.buildCommandRequest = exports.buildAuthenticateRequest = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _crossFetch = __webpack_require__(5);

var _crossFetch2 = _interopRequireDefault(_crossFetch);

var _debug = __webpack_require__(0);

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fetch = typeof window !== "undefined" && window.fetch ? window.fetch : _crossFetch2.default;
var FetchRequest = fetch.Request || Request;
var FetchHeaders = fetch.Headers || Headers;
var pollingRetries = 15;
var pollingInterval = 1000;
var waitInfinitely = -1;

var fetchWithDeadline = function fetchWithDeadline(request) {
  var _this = this;

  var log = (0, _debug2.default)("nqm-api-tdx:fetchWithDeadline");

  //
  // Implement a timeout. We have to do this manually pending a native fix
  // on fetch() - see https://github.com/whatwg/fetch/issues/20).
  //
  return new Promise(function (resolve, reject) {
    var deadline = void 0;
    var rejected = false;

    if (_this.config.networkTimeout) {
      // Reject the promise if the timeout expires.
      deadline = setTimeout(function () {
        log("deadline expired after %d ms", _this.config.networkTimeout);
        deadline = 0;
        rejected = true;
        reject(new Error("deadline expired after " + _this.config.networkTimeout + " ms"));
      }, _this.config.networkTimeout);
    } else {
      // Never timeout.
      deadline = 0;
    }

    var clearTimer = function clearTimer() {
      // Cancel pending deadline.
      if (deadline) {
        clearTimeout(deadline);
        deadline = 0;
      }
    };

    Promise.resolve(fetch(request)).then(function (response) {
      clearTimer();
      // Forward response.
      resolve(response);
    }).catch(function (err) {
      clearTimer();
      if (!rejected) {
        reject(err);
      } else {
        log("already rejected by timeout, ignoring rejection [%s]", err.message);
      }
    });
  });
};

var TDXApiError = function TDXApiError(message, stack) {
  this.name = "TDXApiError";
  this.message = message || "no message given";
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
var handleError = function handleError(source, failure, code) {
  var internal = {
    from: source,
    failure: JSON.stringify(failure),
    code: typeof code === "undefined" ? "n/a" : code
  };
  return new TDXApiError(JSON.stringify(internal), new Error().stack);
};

var buildAuthenticateRequest = function buildAuthenticateRequest(credentials, ip, ttl) {
  // We can get a token from any of the TDX services - use the first one we find to build a fetch Request.
  var uri = (this.config.tdxServer || this.config.commandServer || this.config.queryServer) + "/token";
  return new FetchRequest(uri, {
    method: "POST",
    mode: "cors",
    headers: new FetchHeaders({
      "Authorization": "Basic " + credentials,
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({ grant_type: "client_credentials", ip: ip, ttl: ttl || this.config.accessTokenTTL || 3600 })
  });
};

/**
 * Builds a Request object for the given command bound to the TDX command service.
 * @param  {string} command - the target TDX command, e.g. "resource/create"
 * @param  {object} data - the command payload
 * @param  {string} [contentType=application/json] - the content type
 * @param  {bool} [noSync=false] - send command asynchronously
 */
var buildCommandRequest = function buildCommandRequest(command, data, contentType, async) {
  var commandMode = async ? "command" : "commandSync";
  contentType = contentType || "application/json";
  return new FetchRequest(this.config.commandServer + "/" + commandMode + "/" + command, {
    method: "POST",
    mode: "cors",
    headers: new FetchHeaders({
      "Authorization": "Bearer " + this.accessToken,
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
var buildDatabotHostRequest = function buildDatabotHostRequest(command, data) {
  return new FetchRequest(this.config.databotServer + "/host/" + command, {
    method: "POST",
    mode: "cors",
    headers: new FetchHeaders({
      "Authorization": "Bearer " + this.accessToken,
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
  });
};

var buildFileUploadRequest = function buildFileUploadRequest(resourceId, compressed, base64Encoded, file) {
  var endPoint = void 0;
  if (compressed) {
    endPoint = "compressedUpload";
  } else if (base64Encoded) {
    endPoint = "base64Upload";
  } else {
    endPoint = "upload";
  }

  return new FetchRequest(this.config.commandServer + "/commandSync/resource/" + resourceId + "/" + endPoint, {
    method: "POST",
    mode: "cors",
    headers: new FetchHeaders({
      "Authorization": "Bearer " + this.accessToken,
      "Content-Length": file.size,
      "Content-Disposition": "attachment; filename=\"" + file.name + "\""
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
var buildQueryRequest = function buildQueryRequest(endpoint, filter, projection, options) {
  filter = filter ? encodeURIComponent(JSON.stringify(filter)) : "";
  projection = projection ? encodeURIComponent(JSON.stringify(projection)) : "";
  options = options ? encodeURIComponent(JSON.stringify(options)) : "";
  var query = void 0;
  if (endpoint.indexOf("?") < 0) {
    // There is no query portion in the prefix - add one now.
    query = endpoint + "?filter=" + filter + "&proj=" + projection + "&opts=" + options;
  } else {
    // There is already a query portion, so append the params.
    query = endpoint + "&filter=" + filter + "&proj=" + projection + "&opts=" + options;
  }
  return new FetchRequest("" + this.config.queryServer + query, {
    method: "GET",
    mode: "cors",
    headers: new FetchHeaders({
      "Authorization": "Bearer " + this.accessToken,
      "Content-Type": "application/json"
    })
  });
};

/**
 * Builds a Request object for the given databot instance query bound to the TDX databot server.
 * @param  {string} endpoint - the databot query endpoint, e.g. "status/jDduieG7"
 */
var buildDatabotInstanceRequest = function buildDatabotInstanceRequest(endpoint) {
  return new FetchRequest(this.config.databotServer + "/instance/" + endpoint, {
    method: "GET",
    mode: "cors",
    headers: new FetchHeaders({
      "Authorization": "Bearer " + this.accessToken,
      "Content-Type": "application/json"
    })
  });
};

var checkResponse = function checkResponse(source, doNotThrow, response) {
  // If doNotThrow is omitted default to the config value (which defaults to `false`, i.e. errors will be thrown).
  if ((typeof doNotThrow === "undefined" ? "undefined" : _typeof(doNotThrow)) === "object") {
    response = doNotThrow;
    doNotThrow = !!this.config.doNotThrow;
  }

  return response.json().then(function (json) {
    if (response.ok) {
      return Promise.resolve(json).then(function (tdxResponse) {
        if (!doNotThrow && tdxResponse && tdxResponse.result) {
          // Check for data validation (response) errors. These differ from straight-forward invalid argument
          // failures. For example, a call to `updateData` might include requests to update 10 documents. The TDX
          // will continue to apply updates even after one of them fails. For example, the first 4 updates succeed,
          // the fifth fails and the rest succeed. In this case `tdxResponse` will contain a `result` object with
          // details of the failures in an `error` array property and the successes in an `commit` property.
          if (tdxResponse.result.errors && tdxResponse.result.errors.length) {
            // Reject errors with 409 Conflict status.
            return Promise.reject(handleError(source, {
              code: "DataError",
              message: tdxResponse.result.errors.join(", ")
            }, 409));
          }
        }
        return tdxResponse;
      });
    } else {
      if (json.error) {
        // Build a failure object from the json response.
        var failure = { code: json.error, message: json.error_description };
        return Promise.reject(handleError(source, failure, response.status));
      } else {
        // The response body holds the error details.
        return Promise.reject(handleError(source, json, response.status));
      }
    }
  });
};

var setDefaults = function setDefaults(config) {
  var log = (0, _debug2.default)("nqm-api-tdx:setDefaults");

  // Legacy config support.
  config.tdxServer = config.tdxServer || config.tdxHost;
  config.commandServer = config.commandServer || config.commandHost;
  config.databotServer = config.databotServer || config.databotHost;
  config.queryServer = config.queryServer || config.queryHost;

  if (config.tdxServer && (!config.queryServer || !config.commandServer)) {
    var protocolComponents = config.tdxServer.split("://");
    if (protocolComponents.length !== 2) {
      throw new Error("invalid tdxServer in config - no protocol: " + config.tdxServer);
    }
    var protocol = protocolComponents[0];
    var hostComponents = protocolComponents[1].split(".");
    if (hostComponents.length < 3) {
      throw new Error("invalid tdxServer in config - expected sub.domain.tld: " + config.tdxServer);
    }
    var hostname = hostComponents.slice(1).join(".");
    config.databotServer = config.databotServer || protocol + "://databot." + hostname;
    config.commandServer = config.commandServer || protocol + "://cmd." + hostname;
    config.queryServer = config.queryServer || protocol + "://q." + hostname;
  }

  // Append version qualifier to query path.
  config.queryServer = config.queryServer && config.queryServer + "/v1/";

  log("using hosts: command %s, databot %s, query %s, auth %s", config.commandServer || "[n/a]", config.databotServer || "[n/a]", config.queryServer || "[n/a]", config.tdxServer || "[n/a]");

  // Default network timeout to 2 mins.
  config.networkTimeout = config.networkTimeout === undefined ? 120000 : config.networkTimeout;
};

var waitForResource = function waitForResource(resourceId, check, retryCount, maxRetries) {
  var _this2 = this;

  var log = (0, _debug2.default)("nqm-api-tdx:waitForResource");
  retryCount = retryCount || 0;
  return this.getResource(resourceId).then(function (resource) {
    var checkResult = check(resource, retryCount);
    if (checkResult instanceof Error) {
      log("waitForResource - check failed with error [%s]", checkResult.message);
      return Promise.reject(checkResult);
    }

    if (!checkResult) {
      // A negative maxRetries value will retry indefinitely.
      if (maxRetries >= 0 && retryCount > maxRetries) {
        log("giving up after %d attempts", retryCount);
        return Promise.reject(new Error("gave up waiting for " + resourceId + " after " + retryCount + " attempts"));
      }

      // Try again after a delay.
      log("waiting for %d msec", pollingInterval);
      return new Promise(function (resolve) {
        setTimeout(function () {
          log("trying again");
          resolve(waitForResource.call(_this2, resourceId, check, retryCount + 1, maxRetries));
        }, pollingInterval);
      });
    } else {
      return resource;
    }
  }).catch(function (err) {
    if (err.name !== "TDXApiError") {
      return Promise.reject(err);
    } else {
      try {
        var parseError = JSON.parse(err.message);
        var failure = JSON.parse(parseError.failure);
        // Restify error code had the 'Error' suffix removed post v3.x
        if (failure.code === "NotFound" || failure.code === "NotFoundError" || failure.code === "Unauthorized" || failure.code === "UnauthorizedError") {
          // Ignore resource not found and not authorized errors here, they are probably caused by
          // waiting for the projections to catch up (esp. in debug environments). By falling through
          // we will still be limited by the retry count, so won't loop forever.
          log("ignoring error %s", err.message);
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve(waitForResource.call(_this2, resourceId, check, retryCount + 1, maxRetries));
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

var waitForIndex = function waitForIndex(datasetId, status, maxRetries) {
  var log = (0, _debug2.default)("nqm-api-tdx:waitForIndex");

  // The argument maxRetries is optional.
  if (typeof maxRetries === "undefined") {
    maxRetries = waitInfinitely;
  }
  status = status || "built";

  var initialStatus = "";

  var builtIndexCheck = function builtIndexCheck(dataset, retryCount) {
    log("builtIndexCheck: %s", dataset ? dataset.indexStatus : "no dataset");

    var stopWaiting = void 0;

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
          stopWaiting = new Error("index still in error status after " + retryCount + " retries");
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

var waitForAccount = function waitForAccount(accountId, verified, approved, retryCount, maxRetries) {
  var _this3 = this;

  var log = (0, _debug2.default)("nqm-api-tdx:waitForAccount");
  retryCount = retryCount || 0;
  return this.getAccount(accountId).then(function (account) {
    var retry = false;
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
        return Promise.reject(new Error("gave up waiting for account " + accountId + " after " + retryCount + " attempts"));
      }

      // Try again after a delay.
      log("waiting for %d msec", pollingInterval);
      return new Promise(function (resolve) {
        setTimeout(function () {
          log("trying again");
          resolve(waitForAccount.call(_this3, accountId, verified, approved, retryCount + 1, maxRetries));
        }, pollingInterval);
      });
    } else {
      return account;
    }
  }).catch(function (err) {
    return Promise.reject(err);
  });
};

exports.buildAuthenticateRequest = buildAuthenticateRequest;
exports.buildCommandRequest = buildCommandRequest;
exports.buildDatabotHostRequest = buildDatabotHostRequest;
exports.buildDatabotInstanceRequest = buildDatabotInstanceRequest;
exports.buildFileUploadRequest = buildFileUploadRequest;
exports.buildQueryRequest = buildQueryRequest;
exports.checkResponse = checkResponse;
exports.fetchWithDeadline = fetchWithDeadline;
exports.handleError = handleError;
exports.setDefaults = setDefaults;
exports.TDXApiError = TDXApiError;
exports.waitForAccount = waitForAccount;
exports.waitForIndex = waitForIndex;

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
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = __webpack_require__(3);

var _base2 = _interopRequireDefault(_base);

var _debug = __webpack_require__(0);

var _debug2 = _interopRequireDefault(_debug);

var _nqmCoreUtils = __webpack_require__(2);

var _helpers = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = (0, _debug2.default)("nqm-api-tdx");
var errLog = (0, _debug2.default)("nqm-api-tdx:error");

/**
 * @typedef  {object} CommandResult
 * @property  {string} commandId - The auto-generated unique id of the command.
 * @property  {object|string} response - The response of the command. If a command is sent asynchronously, this will
 * simply be the string `"ack"`. In synchronous mode, this will usually be an object consisting of the primary key
 * of the data that was affected by the command.
 * @property  {object} result - Contains detailed error information when available.
 * @property  {array} result.errors - Will contain error information when appropriate.
 * @property  {array} result.ok - Contains details of each commited document.
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
 * @typedef  {object} Zone
 * @property  {string} accountType
 * @property  {string} displayName
 * @property  {string} username
 */

var TDXApi = function () {
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
   * @param  {bool} [config.doNotThrow] - set to prevent throwing response errors. They will be returned in the
   * {@link CommandResult} object. This was set by default prior to 0.5.x
   * @example <caption>standard usage</caption>
   * import TDXApi from "nqm-api-tdx";
   * const api = new TDXApi({tdxServer: "https://tdx.acme.com"});
   */
  function TDXApi(config) {
    _classCallCheck(this, TDXApi);

    this.config = _extends({}, config);
    this.accessToken = config.accessToken || config.authToken || "";
    (0, _helpers.setDefaults)(this.config);
  }

  /**
   * Authenticates with the TDX, acquiring an authorisation token.
   * @param  {string} id - the account id, or a pre-formed credentials string, e.g. "DKJG8dfg:letmein"
   * @param  {string} secret - the account secret
   * @param  {number} [ttl=3600] - the Time-To-Live of the token in seconds, default is 1 hour.
   * @return  {string} The access token.
   * @exception Will throw if credentials are invalid or there is a network error contacting the TDX.
   * @example <caption>authenticate using a share key and secret</caption>
   * tdxApi.authenticate("DKJG8dfg", "letmein");
   * @example <caption>authenticate using custom ttl of 2 hours</caption>
   * tdxApi.authenticate("DKJG8dfg", "letmein", 7200);
   */


  _createClass(TDXApi, [{
    key: "authenticate",
    value: function authenticate(id, secret, ttl, ip) {
      var _this = this;

      var credentials = void 0;

      if (typeof secret !== "string") {
        // Assume the first argument is a pre-formed credentials string
        credentials = id;
        ip = ttl;
        ttl = secret;
      } else {
        // uri-encode the username and concatenate with secret.
        credentials = encodeURIComponent(id) + ":" + secret;
      }

      // Authorization headers must be base-64 encoded.
      credentials = _base2.default.encode(credentials);

      var request = _helpers.buildAuthenticateRequest.call(this, credentials, ip, ttl);
      return _helpers.fetchWithDeadline.call(this, request).then(_helpers.checkResponse.bind(this, "authenticate")).then(function (result) {
        log(result);
        _this.accessToken = result.access_token;
        return _this.accessToken;
      }).catch(function (err) {
        errLog("authenticate error: " + err.message);
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

  }, {
    key: "addAccount",
    value: function addAccount(options, wait) {
      var _this2 = this;

      var request = _helpers.buildCommandRequest.call(this, "account/create", options);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.addAccount: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "addAccount")).then(function (result) {
        if (wait) {
          return _helpers.waitForAccount.call(_this2, options.username, options.verified, options.approved).then(function () {
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

  }, {
    key: "addAccountApplicationConnection",
    value: function addAccountApplicationConnection(accountId, applicationId) {
      var _this3 = this;

      var wait = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      var request = _helpers.buildCommandRequest.call(this, "applicationConnection/create", { accountId: accountId });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.addAccountApplicationConnection: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "addAccountApplicationConnection")).then(function (result) {
        if (wait) {
          var applicationUserId = (0, _nqmCoreUtils.shortHash)(applicationId + "-" + accountId);
          return _helpers.waitForIndex.call(_this3, applicationUserId).then(function () {
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

  }, {
    key: "approveAccount",
    value: function approveAccount(username, approved) {
      var request = _helpers.buildCommandRequest.call(this, "account/approve", { username: username, approved: approved });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.approveAccount: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "approveAccount"));
    }

    /**
     * Delete an account
     * @param  {string} username - the full TDX identity of the account to delete.
     */

  }, {
    key: "deleteAccount",
    value: function deleteAccount(username) {
      var request = _helpers.buildCommandRequest.call(this, "account/delete", { username: username });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.deleteAccount: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "deleteAccount"));
    }

    /**
     * Change account secret.
     * @param  {string} username - the full TDX identity of the account.
     * @param  {string} key - the new secret
     */

  }, {
    key: "resetAccount",
    value: function resetAccount(username, key) {
      var request = _helpers.buildCommandRequest.call(this, "account/reset", { username: username, key: key });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.resetAccount: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "resetAccount"));
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

  }, {
    key: "updateAccount",
    value: function updateAccount(username, options) {
      var request = _helpers.buildCommandRequest.call(this, "account/update", _extends({ username: username }, options));
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.updateAccount: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "addAccount"));
    }

    /**
     * Set account verified status. Reserved for system use.
     * @param  {string} username - the full TDX identity of the account.
     * @param  {bool} approved - account verified status
     */

  }, {
    key: "verifyAccount",
    value: function verifyAccount(username, verified) {
      var request = _helpers.buildCommandRequest.call(this, "account/verify", { username: username, verified: verified });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.verifyAccount: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "verifyAccount"));
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

  }, {
    key: "addTrustedExchange",
    value: function addTrustedExchange(options) {
      var request = _helpers.buildCommandRequest.call(this, "trustedConnection/create", options);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.addTrustedExchange: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "addTrustedExchange"));
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
     * @param  {bool} [wait=false] - indicates if the call should wait for the index to be built before it returns.
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

  }, {
    key: "addResource",
    value: function addResource(options, wait) {
      var _this4 = this;

      var request = _helpers.buildCommandRequest.call(this, "resource/create", options);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.addResource: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "addResource")).then(function (result) {
        if (wait) {
          return _helpers.waitForIndex.call(_this4, result.response.id).then(function () {
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

  }, {
    key: "addResourceAccess",
    value: function addResourceAccess(resourceId, accountId, sourceId, access) {
      var request = _helpers.buildCommandRequest.call(this, "resourceAccess/add", {
        rid: resourceId,
        aid: accountId,
        src: sourceId,
        acc: [].concat(access)
      });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.addResourceAccess: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "addResourceAccess"));
    }

    /**
     * Permanently deletes a resource.
     * @param  {string} resourceId - the id of the resource to delete. Requires write permission
     * to the resource.
     */

  }, {
    key: "deleteResource",
    value: function deleteResource(resourceId) {
      var request = _helpers.buildCommandRequest.call(this, "resource/delete", { id: resourceId });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.deleteResource: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "deleteResource"));
    }

    /**
     * Permanently deletes a list of resources.
     * Will fail **all** deletes if any of the permission checks fail.
     * @param  {string[]} resourceIdList - This list of resource ids to delete.
     * @return  {CommandResult}
     */

  }, {
    key: "deleteManyResources",
    value: function deleteManyResources(resourceIdList) {
      var request = _helpers.buildCommandRequest.call(this, "resource/deleteMany", { payload: resourceIdList });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.deleteManyResources: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "deleteManyResources"));
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

  }, {
    key: "fileUpload",
    value: function fileUpload(resourceId, file, stream) {
      var compressed = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var base64Encoded = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

      var request = _helpers.buildFileUploadRequest.call(this, resourceId, compressed, base64Encoded, file);
      var response = _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.fileUpload: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      });

      if (stream) {
        return response;
      } else {
        return response.then(function (response) {
          return [response, response.text()];
        }).then(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              response = _ref2[0],
              text = _ref2[1];

          if (response.ok) {
            return Promise.resolve(text);
          } else {
            return Promise.reject((0, _helpers.handleError)("fileUpload", { code: "failure", message: text }));
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

  }, {
    key: "moveResource",
    value: function moveResource(id, fromParentId, toParentId) {
      var request = _helpers.buildCommandRequest.call(this, "resource/move", { id: id, fromParentId: fromParentId, toParentId: toParentId });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.moveResource: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "moveResource"));
    }

    /**
     * Resets the resource index. This involves deleting existing indexes and rebuilding them. May take
     * a while depending on the size of any associated dataset and the number and complexity of indexes.
     * @param  {string} resourceId - the id of the resource, requires write permission.
     */

  }, {
    key: "rebuildResourceIndex",
    value: function rebuildResourceIndex(resourceId) {
      var _this5 = this;

      var request = _helpers.buildCommandRequest.call(this, "resource/index/rebuild", { id: resourceId });
      var result = void 0;
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.rebuildResourceIndex: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "rebuildIndex")).then(function (res) {
        result = res;
        return _helpers.waitForIndex.call(_this5, result.response.id, "built");
      }).then(function () {
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

  }, {
    key: "removeResourceAccess",
    value: function removeResourceAccess(resourceId, accountId, addedBy, sourceId, access) {
      var request = _helpers.buildCommandRequest.call(this, "resourceAccess/delete", {
        rid: resourceId,
        aid: accountId,
        by: addedBy,
        src: sourceId,
        acc: access
      });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.removeResourceAccess: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "removeResourceAccess"));
    }

    /**
     * Set the resource schema.
     * @param  {string} resourceId - The id of the dataset-based resource.
     * @param  {object} schema - The new schema definition. TODO - document
     * @return  {CommandResult}
     */

  }, {
    key: "setResourceSchema",
    value: function setResourceSchema(resourceId, schema) {
      var request = _helpers.buildCommandRequest.call(this, "resource/schema/set", { id: resourceId, schema: schema });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.setResourceSchema: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "setResourceSchema"));
    }

    /**
     * Set the share mode for a resource.
     * @param  {string} resourceId - The resource id.
     * @param  {string} shareMode - The share mode to set, one or [`"pw"`, `"pr"`, `"tr"`] corresponding to
     * 'public read/write', 'public read, trusted write', 'trusted only'.
     */

  }, {
    key: "setResourceShareMode",
    value: function setResourceShareMode(resourceId, shareMode) {
      var request = _helpers.buildCommandRequest.call(this, "resource/setShareMode", { id: resourceId, shareMode: shareMode });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.setResourceShareMode: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "setResourceShareMode"));
    }

    /**
     * Sets the permissive share mode of the resource. Permissive share allows anybody with acces to the resource
     * to share it with others. If a resource is not in permissive share mode, only the resource owner
     * can share it with others.
     * @param  {string} resourceId - The resource id.
     * @param  {bool} allowPermissive - The required permissive share mode.
     */

  }, {
    key: "setResourcePermissiveShare",
    value: function setResourcePermissiveShare(resourceId, allowPermissive) {
      var request = _helpers.buildCommandRequest.call(this, "resource/setPermissiveShare", {
        id: resourceId,
        permissiveShare: allowPermissive ? "r" : ""
      });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.setResourcePermissiveShare: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "setResourcePermissiveShare"));
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

  }, {
    key: "setResourceTextContent",
    value: function setResourceTextContent(resourceId, textContent) {
      var request = _helpers.buildCommandRequest.call(this, "resource/textContent/set", { id: resourceId, textContent: textContent });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.setResourceTextContent: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "setResourceTextContent"));
    }

    /**
     * Suspends the resource index. This involves deleting any existing indexes. Requires write permission. When
     * a resource index is in `suspended` status, it is not possible to run any queries or updates against
     * the resource.
     * @param  {string} resourceId - the id of the resource. Requires write permission.
     */

  }, {
    key: "suspendResourceIndex",
    value: function suspendResourceIndex(resourceId) {
      var _this6 = this;

      var request = _helpers.buildCommandRequest.call(this, "resource/index/suspend", { id: resourceId });
      var result = void 0;
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.suspendResourceIndex: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "suspendIndex")).then(function (res) {
        result = res;
        return _helpers.waitForIndex.call(_this6, result.response.id, "suspended");
      }).then(function () {
        return result;
      });
    }

    /**
     * Removes all data from the resource. Applicable to dataset-based resources only. This can not be
     * undone.
     * @param  {string} resourceId - The resource id to truncate.
     */

  }, {
    key: "truncateResource",
    value: function truncateResource(resourceId) {
      var request = _helpers.buildCommandRequest.call(this, "resource/truncate", { id: resourceId });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.truncateResource: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "truncateResource"));
    }

    /**
     * Modify one or more of the meta data associated with the resource.
     * @param  {string} resourceId - id of the resource to update
     * @param  {object} update - object containing the properties to update. Can be one or more of those
     * listed below. See the {@link TDXApi#addResource} method for semantics and syntax of each property.
     * @param  {string} [update.derived]
     * @param  {string} [update.description]
     * @param  {string} [update.meta]
     * @param  {string} [update.name]
     * @param  {string} [update.provenance]
     * @param  {string} [update.queryProxy]
     * @param  {string} [update.schema]
     * @param  {string} [update.tags]
     * @param  {string} [update.textContent] see also {@link TDXApi#setResourceTextContent}
     */

  }, {
    key: "updateResource",
    value: function updateResource(resourceId, update) {
      var request = _helpers.buildCommandRequest.call(this, "resource/update", _extends({ id: resourceId }, update));
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.updateResource: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "updateResource"));
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

  }, {
    key: "addData",
    value: function addData(datasetId, data, doNotThrow) {
      var postData = {
        datasetId: datasetId,
        payload: [].concat(data)
      };
      var request = _helpers.buildCommandRequest.call(this, "dataset/data/createMany", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.addData: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "addData", doNotThrow));
    }

    /**
     * Deletes data from a dataset-based resource.
     * @param  {string} datasetId - The id of the dataset-based resource to delete data from.
     * @param  {object|array} data - The primary key data to delete.
     * @param  {bool} [doNotThrow=false] - set to override default error handling. See {@link TDXApi}.
     */

  }, {
    key: "deleteData",
    value: function deleteData(datasetId, data, doNotThrow) {
      var postData = {
        datasetId: datasetId,
        payload: [].concat(data)
      };
      var request = _helpers.buildCommandRequest.call(this, "dataset/data/deleteMany", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.deleteData: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "deleteData", doNotThrow));
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

  }, {
    key: "deleteDataByQuery",
    value: function deleteDataByQuery(datasetId, query, doNotThrow) {
      var postData = {
        datasetId: datasetId,
        query: JSON.stringify(query)
      };
      var request = _helpers.buildCommandRequest.call(this, "dataset/data/deleteQuery", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.deleteDataByQuery: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "deleteDataByQuery", doNotThrow));
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

  }, {
    key: "patchData",
    value: function patchData(datasetId, data, doNotThrow) {
      var postData = {
        datasetId: datasetId,
        payload: [].concat(data)
      };
      var request = _helpers.buildCommandRequest.call(this, "dataset/data/upsertMany", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.patchData: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "patchData", doNotThrow));
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

  }, {
    key: "updateData",
    value: function updateData(datasetId, data, upsert, doNotThrow) {
      var postData = {
        datasetId: datasetId,
        payload: [].concat(data),
        __upsert: !!upsert
      };
      var request = _helpers.buildCommandRequest.call(this, "dataset/data/updateMany", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.updateData: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "updateData", doNotThrow));
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

  }, {
    key: "updateDataByQuery",
    value: function updateDataByQuery(datasetId, query, update, doNotThrow) {
      var postData = {
        datasetId: datasetId,
        query: JSON.stringify(query),
        update: update
      };
      var request = _helpers.buildCommandRequest.call(this, "dataset/data/updateQuery", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.updateDataByQuery: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "updateDataByQuery", doNotThrow));
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

  }, {
    key: "deleteDatabotHost",
    value: function deleteDatabotHost(payload) {
      var postData = {
        payload: payload
      };
      var request = _helpers.buildCommandRequest.call(this, "databot/host/delete", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.deleteDatabotHost: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "deleteDatabotHost"));
    }

    /**
     * Deletes a databot instance and all output/debug data associated with it.
     * @param  {string[]} instanceId - The id(s) of the instances to delete. Can be an array of instance ids or an
     * individual string id
     */

  }, {
    key: "deleteDatabotInstance",
    value: function deleteDatabotInstance(instanceId) {
      var postData = {
        instanceId: [].concat(instanceId)
      };
      var request = _helpers.buildCommandRequest.call(this, "databot/deleteInstance", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.deleteDatabotInstance: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "deleteDatabotInstance"));
    }

    /**
     * Gets databot instance data for the given instance id.
     * @param  {string} instanceId - The id of the instance to retrieve.
     */

  }, {
    key: "getDatabotInstance",
    value: function getDatabotInstance(instanceId) {
      var request = _helpers.buildDatabotInstanceRequest.call(this, instanceId);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getDatabotInstance: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "getDatabotInstance"));
    }

    /**
     * Get databot instance output.
     * @param  {string} instanceId - The instance id to retrieve output for.
     * @param  {string} [processId] - Optional process id. If omitted, output for all instance processes will be returned.
     */

  }, {
    key: "getDatabotInstanceOutput",
    value: function getDatabotInstanceOutput(instanceId, processId) {
      var request = _helpers.buildDatabotInstanceRequest.call(this, "output/" + instanceId + "/" + (processId || ""));
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getDatabotInstanceOutput: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "getDatabotInstanceOutput"));
    }

    /**
     * Get databot instance status.
     * @param  {string} instanceId - The id of the databot instance for which status is retrieved.
     */

  }, {
    key: "getDatabotInstanceStatus",
    value: function getDatabotInstanceStatus(instanceId) {
      var request = _helpers.buildDatabotInstanceRequest.call(this, "status/" + instanceId);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getDatabotInstanceStatus: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "getDatabotInstanceStatus"));
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

  }, {
    key: "registerDatabotHost",
    value: function registerDatabotHost(payload) {
      var request = _helpers.buildDatabotHostRequest.call(this, "register", payload);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.registerDatabotHost: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "registerDatabotHost"));
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

  }, {
    key: "sendDatabotHostCommand",
    value: function sendDatabotHostCommand(command, hostId, hostIp, hostPort, payload) {
      var postData = {
        hostId: hostId,
        hostIp: hostIp,
        hostPort: hostPort,
        command: command,
        payload: payload
      };
      var request = _helpers.buildCommandRequest.call(this, "databot/host/command", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.sendDatabotHostCommand: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "sendDatabotHostCommand"));
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

  }, {
    key: "startDatabotInstance",
    value: function startDatabotInstance(databotId, payload) {
      var postData = {
        databotId: databotId,
        instanceData: payload
      };
      var request = _helpers.buildCommandRequest.call(this, "databot/startInstance", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.startDatabotInstance: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "startDatabotInstance"));
    }

    /**
     * Terminates or pauses a running databot instance.
     * @param  {string} instanceId - The id of the instance to terminate or pause.
     * @param  {string} mode - One of [`"stop"`, `"pause"`, `"resume"`]
     */

  }, {
    key: "stopDatabotInstance",
    value: function stopDatabotInstance(instanceId, mode) {
      var postData = {
        instanceId: instanceId,
        mode: mode
      };
      var request = _helpers.buildCommandRequest.call(this, "databot/stopInstance", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.stopDatabotInstance: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "stopDatabotInstance"));
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

  }, {
    key: "updateDatabotHostStatus",
    value: function updateDatabotHostStatus(payload) {
      var request = _helpers.buildDatabotHostRequest.call(this, "status", payload);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.updateDatabotHostStatus: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "updateDatabotHostStatus"));
    }

    /**
     * Stores databot instance output on the TDX.
     * @param  {object} output - The output payload for the databot instance.
     */

  }, {
    key: "writeDatabotHostInstanceOutput",
    value: function writeDatabotHostInstanceOutput(output) {
      var request = _helpers.buildDatabotHostRequest.call(this, "output", output);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.writeDatabotHostInstanceOutput: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "writeDatabotHostInstanceOutput"));
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

  }, {
    key: "addZoneConnection",
    value: function addZoneConnection(options) {
      var request = _helpers.buildCommandRequest.call(this, "zoneConnection/create", options);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.addZoneConnection: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "addZoneConnection"));
    }

    /**
     * Deletes a zone connection. The authenticated account must own the zone connection.
     * @param  {string} id - The id of the zone connection to delete.
     */

  }, {
    key: "deleteZoneConnection",
    value: function deleteZoneConnection(id) {
      var request = _helpers.buildCommandRequest.call(this, "zoneConnection/delete", { id: id });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.deleteZoneConnection: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "deleteZoneConnection"));
    }

    /**
     * AUDIT COMMANDS
     */

  }, {
    key: "rollbackCommand",
    value: function rollbackCommand(id) {
      var request = _helpers.buildCommandRequest.call(this, "rollback", { id: id });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.rollbackCommand: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "rollbackCommand"));
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
     * @return  {object} - The new token application-user token, bound to the given IP.
     * @example <caption>create token bound to server ip with default TDX ttl</caption>
     * tdxApi.createTDXToken("bob@bob.com/acme.tdx.com");
     * @example <caption>create for specific IP</caption>
     * tdxApi.createTDXToken("bob@bob.com/acme.tdx.com", newClientIP);
     */

  }, {
    key: "createTDXToken",
    value: function createTDXToken(username, ip, ttl) {
      var request = _helpers.buildQueryRequest.call(this, "token/create", { username: username, ip: ip, ttl: ttl });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.createTDXToken: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "createTDXToken"));
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

  }, {
    key: "exchangeTDXToken",
    value: function exchangeTDXToken(token, validateIP, exchangeIP, ttl) {
      var request = _helpers.buildQueryRequest.call(this, "token/exchange", { token: token, ip: validateIP, exchangeIP: exchangeIP, ttl: ttl });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.exchangeTDXToken: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "exchangeTDXToken"));
    }

    /**
     * Streams the contents of a resource. For dataset-based resources this will stream the dataset contents in newline
     * delimited JSON (NDJSON). For raw file resources this will stream the raw file contents (zip, raw JSON etc).
     * @param  {string} resourceId - The id of the resource to be downloaded.
     * @return {object} - Response object, where the response body is a stream object.
     */

  }, {
    key: "downloadResource",
    value: function downloadResource(resourceId) {
      var request = _helpers.buildQueryRequest.call(this, "resources/" + resourceId + "/download");
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.downloadResource: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      });
    }

    /**
     * Gets the details for a given account id.
     * @param  {string} accountId - the id of the account to be retrieved.
     * @return  {Zone} zone
     */

  }, {
    key: "getAccount",
    value: function getAccount(accountId) {
      var request = _helpers.buildQueryRequest.call(this, "accounts", { username: accountId });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getAccount: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "getAccount")).then(function (accountList) {
        return accountList && accountList.length ? accountList[0] : null;
      });
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

  }, {
    key: "getAggregateDataStream",
    value: function getAggregateDataStream(datasetId, pipeline, ndJSON) {
      // Convert pipeline to string if necessary.
      if (pipeline && (typeof pipeline === "undefined" ? "undefined" : _typeof(pipeline)) === "object") {
        pipeline = JSON.stringify(pipeline);
      }
      var endpoint = "resources/" + datasetId + "/" + (ndJSON ? "ndaggregate" : "aggregate") + "?pipeline=" + pipeline;
      var request = _helpers.buildQueryRequest.call(this, endpoint);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getAggregateData: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
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

  }, {
    key: "getAggregateData",
    value: function getAggregateData(datasetId, pipeline, ndJSON) {
      return this.getAggregateDataStream(datasetId, pipeline, ndJSON).then(_helpers.checkResponse.bind(this, "getAggregateData"));
    }

    /**
     * Gets details of the currently authenticated account.
     * @return  {object} - Details of the authenticated account.
     */

  }, {
    key: "getAuthenticatedAccount",
    value: function getAuthenticatedAccount() {
      var request = _helpers.buildQueryRequest.call(this, "auth-account");
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getAuthenticatedAccount: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "getAuthenticatedAccount"));
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

  }, {
    key: "getDataStream",
    value: function getDataStream(datasetId, filter, projection, options, ndJSON) {
      var endpoint = "resources/" + datasetId + "/" + (ndJSON ? "nddata" : "data");
      var request = _helpers.buildQueryRequest.call(this, endpoint, filter, projection, options);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getDataStream: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      });
    }

    /**
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

  }, {
    key: "getData",
    value: function getData(datasetId, filter, projection, options, ndJSON) {
      return this.getDataStream(datasetId, filter, projection, options, ndJSON).then(_helpers.checkResponse.bind(this, "getData"));
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

  }, {
    key: "getDatasetDataStream",
    value: function getDatasetDataStream(datasetId, filter, projection, options, ndJSON) {
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

  }, {
    key: "getDatasetData",
    value: function getDatasetData(datasetId, filter, projection, options, ndJSON) {
      return this.getData(datasetId, filter, projection, options, ndJSON);
    }

    /**
     * Gets a count of the data in a dataset-based resource, after applying the given filter.
     * @param  {string} datasetId - The id of the dataset-based resource.
     * @param  {object} [filter] - An optional mongodb filter to apply before counting the data.
     */

  }, {
    key: "getDataCount",
    value: function getDataCount(datasetId, filter) {
      var request = _helpers.buildQueryRequest.call(this, "resources/" + datasetId + "/count", filter);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getDataCount: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "getDataCount"));
    }

    /**
     * @deprecated  use {@link TDXApi#getDataCount}
     * Gets a count of the data in a dataset-based resource, after applying the given filter.
     * @param  {string} datasetId - The id of the dataset-based resource.
     * @param  {object} [filter] - An optional mongodb filter to apply before counting the data.
     */

  }, {
    key: "getDatasetDataCount",
    value: function getDatasetDataCount(datasetId, filter) {
      return this.getDataCount(datasetId, filter);
    }

    /**
     * Gets a list of distinct values for a given property in a dataset-based resource.
     * @param  {string} datasetId - The id of the dataset-based resource.
     * @param  {string} key - The name of the property to use. Can be a property path, e.g. `"address.postcode"`.
     * @param  {object} [filter] - An optional mongodb filter to apply.
     * @return  {object[]} - The distinct values.
     */

  }, {
    key: "getDistinct",
    value: function getDistinct(datasetId, key, filter, projection, options) {
      var request = _helpers.buildQueryRequest.call(this, "resources/" + datasetId + "/distinct?key=" + key, filter, projection, options); // eslint-disable-line max-len
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getDistinct: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "getDistinct"));
    }

    /**
     * Gets the details for a given resource id.
     * @param  {string} resourceId - The id of the resource to retrieve.
     * @param  {bool} [noThrow=false] - If set, the call won't reject or throw if the resource doesn't exist.
     * @return  {Resource}
     * @exception  Will throw if the resource is not found (see `noThrow` flag) or permission is denied.
     */

  }, {
    key: "getResource",
    value: function getResource(resourceId, noThrow) {
      var _this7 = this;

      var request = _helpers.buildQueryRequest.call(this, "resources/" + resourceId);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getResource: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(function (response) {
        if (noThrow) {
          // If noThrow specified, return null if there is an error fetching the resource, rather than throwing.
          if (response.ok) {
            return response.json();
          } else if (response.status === 404) {
            return null;
          } else {
            return _helpers.checkResponse.call(_this7, "getResource", response);
          }
        } else {
          return _helpers.checkResponse.call(_this7, "getResource", response);
        }
      });
    }

    /**
     * Gets all access the authenticated account has to the given resource id.
     * @param  {string} resourceId - The id of the resource whose access is to be retrieved.
     * @return {object[]} - Array of access objects.
     */

  }, {
    key: "getResourceAccess",
    value: function getResourceAccess(resourceId, filter, projection, options) {
      var _this8 = this;

      var request = _helpers.buildQueryRequest.call(this, "resources/" + resourceId + "/access", filter, projection, options);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getResourceAccess: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(function (response) {
        return _helpers.checkResponse.call(_this8, "getResourceAccess", response);
      });
    }

    /**
     * Gets all resources that are ancestors of the given resource.
     * @param  {string} resourceId - The id of the resource whose parents are to be retrieved.
     * @return  {Resource[]}
     */

  }, {
    key: "getResourceAncestors",
    value: function getResourceAncestors(resourceId) {
      var request = _helpers.buildQueryRequest.call(this, "resources/" + resourceId + "/ancestors");
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getDatasetAncestors: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "getResourceAncestors"));
    }

    /**
     * Gets the details of all resources that match the given filter.
     * @param  {object} [filter] - A mongodb filter definition
     * @param  {object} [projection] - A mongodb projection definition, can be used to restrict which properties are
     * returned thereby limiting the payload.
     * @param  {object} [options] - A mongodb options definition, can be used for limit, skip, sorting etc.
     * @return  {Resource[]}
     */

  }, {
    key: "getResources",
    value: function getResources(filter, projection, options) {
      var request = _helpers.buildQueryRequest.call(this, "resources", filter, projection, options);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getResource: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "getResources"));
    }

    /**
     * Retrieves all resources that have an immediate ancestor of the given schema id.
     * @param  {string} schemaId - The id of the schema to match, e.g. `"geojson"`.
     * @return  {Resource[]}
     */

  }, {
    key: "getResourcesWithSchema",
    value: function getResourcesWithSchema(schemaId) {
      var filter = { "schemaDefinition.parent": schemaId };
      return this.getResources(filter);
    }

    /**
     * Retrieves an authorisation token for the given TDX instance
     * @param  {string} tdx - The TDX instance name, e.g. `"tdx.acme.com"`.
     * @return  {string}
     */

  }, {
    key: "getTDXToken",
    value: function getTDXToken(tdx) {
      var request = _helpers.buildQueryRequest.call(this, "tdx-token/" + tdx);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getTDXToken: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "getTDXToken"));
    }

    /**
     * Gets the details for a given zone (account) id.
     * @param  {string} accountId - the id of the zone to be retrieved.
     * @return  {Zone} zone
     */

  }, {
    key: "getZone",
    value: function getZone(accountId) {
      return this.getAccount(accountId);
    }

    /**
     * Determines if the given account is a member of the given group.
     * @param {string} accountId - the id of the account
     * @param {*} groupId - the id of the group
     */

  }, {
    key: "isInGroup",
    value: function isInGroup(accountId, groupId) {
      var lookup = {
        aid: accountId,
        "r.0": { $exists: true },
        grp: "m"
      };
      return this.getResourceAccess(groupId, lookup).then(function (access) {
        return !!access.length;
      });
    }

    /**
     * Validates the given token was signed by this TDX, and returns the decoded token data.
     * @param  {string} token - The TDX auth server token to validate.
     * @param  {string} [ip] - The optional IP address to validate against.
     * @return  {object} - The decoded token data.
     */

  }, {
    key: "validateTDXToken",
    value: function validateTDXToken(token, ip) {
      var request = _helpers.buildQueryRequest.call(this, "token/validate", { token: token, ip: ip });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.validateTDXToken: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(this, "validateTDXToken"));
    }
  }]);

  return TDXApi;
}();

exports.default = TDXApi;
module.exports = exports["default"];

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ })
/******/ ]);
});
//# sourceMappingURL=nqm-api-tdx.js.map