(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("debug"), require("base-64"), require("@nqminds/isomorphic-fetch"), require("bluebird"));
	else if(typeof define === 'function' && define.amd)
		define("nqm-api-tdx", ["debug", "base-64", "@nqminds/isomorphic-fetch", "bluebird"], factory);
	else if(typeof exports === 'object')
		exports["nqm-api-tdx"] = factory(require("debug"), require("base-64"), require("@nqminds/isomorphic-fetch"), require("bluebird"));
	else
		root["nqm-api-tdx"] = factory(root["debug"], root["base-64"], root["@nqminds/isomorphic-fetch"], root["bluebird"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
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
exports.waitForIndex = exports.TDXApiError = exports.setDefaults = exports.handleError = exports.fetchWithDeadline = exports.checkResponse = exports.buildQueryRequest = exports.buildDatabotInstanceRequest = exports.buildDatabotHostRequest = exports.buildCommandRequest = undefined;

var _debug = __webpack_require__(0);

var _debug2 = _interopRequireDefault(_debug);

var _bluebird = __webpack_require__(5);

var _bluebird2 = _interopRequireDefault(_bluebird);

var _isomorphicFetch = __webpack_require__(4);

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Bind to bluebird promise library for now.
_isomorphicFetch2.default.Promise = _bluebird2.default;

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
  return new _bluebird2.default(function (resolve, reject) {
    // Reject the promise if the timeout expires.
    var deadline = setTimeout(function () {
      log("deadline expired after %d ms", _this.config.networkTimeout);
      reject(new Error("deadline expired after " + _this.config.networkTimeout + " ms"));
    }, _this.config.networkTimeout);

    (0, _isomorphicFetch2.default)(request).then(function (response) {
      // Cancel pending deadline.
      clearTimeout(deadline);
      // Forward response.
      resolve(response);
    }, reject // Blindly forward all rejections.
    );
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
  return new Request(this.config.commandServer + "/" + commandMode + "/" + command, {
    method: "POST",
    mode: "cors",
    headers: new Headers({
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
  return new Request(this.config.databotServer + "/host/" + command, {
    method: "POST",
    mode: "cors",
    headers: new Headers({
      "Authorization": "Bearer " + this.accessToken,
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
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
  filter = filter ? JSON.stringify(filter) : "";
  projection = projection ? JSON.stringify(projection) : "";
  options = options ? JSON.stringify(options) : "";
  var query = void 0;
  if (endpoint.indexOf("?") < 0) {
    // There is no query portion in the prefix - add one now.
    query = endpoint + "?filter=" + filter + "&proj=" + projection + "&opts=" + options;
  } else {
    // There is already a query portion, so append the params.
    query = endpoint + "&filter=" + filter + "&proj=" + projection + "&opts=" + options;
  }
  return new Request("" + this.config.queryServer + query, {
    method: "GET",
    mode: "cors",
    headers: new Headers({
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
  return new Request(this.config.databotServer + "/instance/" + endpoint, {
    method: "GET",
    mode: "cors",
    headers: new Headers({
      "Authorization": "Bearer " + this.accessToken,
      "Content-Type": "application/json"
    })
  });
};

var checkResponse = function checkResponse(source, response) {
  return response.json().then(function (json) {
    if (response.ok) {
      return _bluebird2.default.resolve(json);
    } else {
      if (json.error) {
        // Build a failure object from the json response.
        var failure = { code: json.error, message: json.error_description };
        return _bluebird2.default.reject(handleError(source, failure, response.status));
      } else {
        // The response body holds the error details.
        return _bluebird2.default.reject(handleError(source, json, response.status));
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

  // Default network timeout to 5 seconds.
  config.networkTimeout = config.networkTimeout || 120000;
};

var waitForResource = function waitForResource(resourceId, check, retryCount, maxRetries) {
  var _this2 = this;

  var log = (0, _debug2.default)("nqm-api-tdx:waitForResource");
  retryCount = retryCount || 0;
  return this.getResource(resourceId).then(function (resource) {
    var checkResult = check(resource, retryCount);
    if (checkResult instanceof Error) {
      log("waitForResource - check failed with error [%s]", checkResult.message);
      return _bluebird2.default.reject(checkResult);
    }

    if (!checkResult) {
      // A negative maxRetries value will retry indefinitely.
      if (maxRetries >= 0 && retryCount > maxRetries) {
        log("giving up after %d attempts", retryCount);
        return _bluebird2.default.reject(new Error("gave up waiting for " + resourceId + " after " + retryCount + " attempts"));
      }

      // Try again after a delay.
      log("waiting for %d msec", pollingInterval);
      return new _bluebird2.default(function (resolve) {
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
      return _bluebird2.default.reject(err);
    } else {
      try {
        var parseError = JSON.parse(err.message);
        var failure = JSON.parse(parseError.failure);
        // Restify error code had the 'Error' suffix removed post v3.x
        if (failure.code === "NotFound" || failure.code === "NotFoundError" || failure.code === "Unauthorized" || failure.code === "UnauthorizedError") {
          // Ignore resource not found and not authorized errors here, they are probably caused by
          // waiting for the projections to catch up (esp. in debug environments) by falling through
          // we will still be limited by the retry count, so won't loop forever.
          log("ignoring error %s", err.message);
          return new _bluebird2.default(function (resolve) {
            setTimeout(function () {
              resolve(waitForResource.call(_this2, resourceId, check, retryCount + 1, maxRetries));
            }, pollingInterval);
          });
        } else {
          // All other errors are fatal.
          return _bluebird2.default.reject(err);
        }
      } catch (parseEx) {
        // Failed to parse TDX error - re-throw the original error.
        log("failure: [%s]", parseEx.message);
        return _bluebird2.default.reject(err);
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

    var continueWaiting = void 0;

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

  return waitForResource.call(this, datasetId, builtIndexCheck, 0, maxRetries);
};

exports.buildCommandRequest = buildCommandRequest;
exports.buildDatabotHostRequest = buildDatabotHostRequest;
exports.buildDatabotInstanceRequest = buildDatabotInstanceRequest;
exports.buildQueryRequest = buildQueryRequest;
exports.checkResponse = checkResponse;
exports.fetchWithDeadline = fetchWithDeadline;
exports.handleError = handleError;
exports.setDefaults = setDefaults;
exports.TDXApiError = TDXApiError;
exports.waitForIndex = waitForIndex;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = __webpack_require__(2);

var _base2 = _interopRequireDefault(_base);

var _debug = __webpack_require__(0);

var _debug2 = _interopRequireDefault(_debug);

var _helpers = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = (0, _debug2.default)("nqm-api-tdx");
var errLog = (0, _debug2.default)("nqm-api-tdx:error");

/**
 * @typedef  {object} CommandResult
 * @property  {string} commandId - The auto-generated unique id of the command.
 * @property  {object|string} response - The result of the command. If a command is sent asynchronously, this will
 * simply be the string `"ack"`. In synchronous mode, this will usually be an object consisting of the primary key
 * of the data that was affected by the command.
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
   * @example <caption>standard usage</caption>
   * import TDXApi from "nqm-api-tdx";
   * const api = new TDXApi({tdxServer: "https://tdx.acme.com"});
   */
  function TDXApi(config) {
    _classCallCheck(this, TDXApi);

    this.config = _extends({}, config);
    this.accessToken = config.accessToken || "";
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
        ttl = secret;
      } else {
        // uri-encode the username and concatenate with secret.
        credentials = encodeURIComponent(id) + ":" + secret;
      }

      // Authorization headers must be base-64 encoded.
      credentials = _base2.default.encode(credentials);

      // We can get a token from any of the TDX services - use the first one we find to build a fetch Request.
      var uri = (this.config.tdxServer || this.config.commandServer || this.config.queryServer) + "/token";
      var request = new Request(uri, {
        method: "POST",
        mode: "cors",
        headers: new Headers({
          "Authorization": "Basic " + credentials,
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ grant_type: "client_credentials", ip: ip, ttl: ttl || this.config.accessTokenTTL || 3600 })
      });

      return _helpers.fetchWithDeadline.call(this, request).then(_helpers.checkResponse.bind(null, "authenticate")).then(function (result) {
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
     * @return  {CommandResult}
     */

  }, {
    key: "addAccount",
    value: function addAccount(options) {
      var request = _helpers.buildCommandRequest.call(this, "account/create", options);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.addAccount: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "addAccount"));
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
      }).then(_helpers.checkResponse.bind(null, "approveAccount"));
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
      }).then(_helpers.checkResponse.bind(null, "deleteAccount"));
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
      }).then(_helpers.checkResponse.bind(null, "resetAccount"));
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
      }).then(_helpers.checkResponse.bind(null, "addAccount"));
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
      }).then(_helpers.checkResponse.bind(null, "verifyAccount"));
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
      }).then(_helpers.checkResponse.bind(null, "addTrustedExchange"));
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
     * @param  {object} [options.schema] - optional schema definition.
     * @param  {string} [options.shareMode] - the share mode assigned to the new resource. One of [`"pw"`, `"pr"`,
     * `"tr"`], corresponding to "public read/write", "public read/trusted write", "trusted only".
     * @param  {string[]} [options.tags] - a list of tags to associate with the resource.
     * @param  {bool} [wait=false] - indicates if the call should wait for the index to be built before it returns.
     */

  }, {
    key: "addResource",
    value: function addResource(options, wait) {
      var _this2 = this;

      var request = _helpers.buildCommandRequest.call(this, "resource/create", options);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.addResource: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "addResource")).then(function (result) {
        if (wait) {
          return _helpers.waitForIndex.call(_this2, result.response.id).then(function () {
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
      }).then(_helpers.checkResponse.bind(null, "addResourceAccess"));
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
      }).then(_helpers.checkResponse.bind(null, "deleteResource"));
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
      }).then(_helpers.checkResponse.bind(null, "deleteManyResources"));
    }

    /**
     * Upload a file to a resource.
     * @param  {string} resourceId - The id of the destination resource.
     * @param  {object} file - The file to upload, obtained from an `<input type="file">` element.
     * @param  {bool} [stream=false] - Flag indicating whether the call should return a stream allowing
     * callees to monitor progress.
     */

  }, {
    key: "fileUpload",
    value: function fileUpload(resourceId, file, stream) {
      var request = new Request(this.config.commandServer + "/commandSync/resource/" + resourceId + "/upload", {
        method: "POST",
        mode: "cors",
        headers: new Headers({
          "Authorization": "Bearer " + this.accessToken,
          "Content-Disposition": "attachment; filename=\"" + file.name + "\"",
          "Content-Length": file.size
        }),
        body: file
      });

      var response = _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.fileUpload: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      });

      if (stream) {
        return response;
      } else {
        return response.then(function (response) {
          return [response, response.text()];
        }).spread(function (response, text) {
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
      }).then(_helpers.checkResponse.bind(null, "moveResource"));
    }

    /**
     * Resets the resource index. This involves deleting existing indexes and rebuilding them. May take
     * a while depending on the size of any associated dataset and the number and complexity of indexes.
     * @param  {string} resourceId - the id of the resource, requires write permission.
     */

  }, {
    key: "rebuildResourceIndex",
    value: function rebuildResourceIndex(resourceId) {
      var _this3 = this;

      var request = _helpers.buildCommandRequest.call(this, "resource/index/rebuild", { id: resourceId });
      var result = void 0;
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.rebuildResourceIndex: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "rebuildIndex")).then(function (res) {
        result = res;
        return _helpers.waitForIndex.call(_this3, result.response.id, "built");
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
      }).then(_helpers.checkResponse.bind(null, "removeResourceAccess"));
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
      }).then(_helpers.checkResponse.bind(null, "setResourceSchema"));
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
      }).then(_helpers.checkResponse.bind(null, "setResourceShareMode"));
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
      }).then(_helpers.checkResponse.bind(null, "setResourcePermissiveShare"));
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
      var _this4 = this;

      var request = _helpers.buildCommandRequest.call(this, "resource/index/suspend", { id: resourceId });
      var result = void 0;
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.suspendResourceIndex: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "suspendIndex")).then(function (res) {
        result = res;
        return _helpers.waitForIndex.call(_this4, result.response.id, "suspended");
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
      }).then(_helpers.checkResponse.bind(null, "truncateResource"));
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
     * @param  {string} [update.schema]
     * @param  {string} [update.tags]
     */

  }, {
    key: "updateResource",
    value: function updateResource(resourceId, update) {
      var request = _helpers.buildCommandRequest.call(this, "resource/update", _extends({ id: resourceId }, update));
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.updateResource: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "updateResource"));
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
    value: function addData(datasetId, data) {
      var postData = {
        datasetId: datasetId,
        payload: [].concat(data)
      };
      var request = _helpers.buildCommandRequest.call(this, "dataset/data/createMany", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.createData: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "updateData"));
    }

    /**
     * Deletes data from a dataset-based resource.
     * @param  {string} datasetId - The id of the dataset-based resource to delete data from.
     * @param  {object|array} data - The primary key data to delete.
     */

  }, {
    key: "deleteData",
    value: function deleteData(datasetId, data) {
      var postData = {
        datasetId: datasetId,
        payload: [].concat(data)
      };
      var request = _helpers.buildCommandRequest.call(this, "dataset/data/deleteMany", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.deleteData: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "deleteData"));
    }

    /**
     * Deletes data from a dataset-based resource using a query to specify the documents to be deleted.
     * @param  {string} datasetId - The id of the dataset-based resource to delete data from.
     * @param  {object} query - The query that specifies the data to delete. All documents matching the
     * query will be deleted.
     * @example
     * // Delete all documents with English lsoa.
     * tdxApi.deleteDataByQuery(myDatasetId, {lsoa: {$regex: "E*"}});
     */

  }, {
    key: "deleteDataByQuery",
    value: function deleteDataByQuery(datasetId, query) {
      var postData = {
        datasetId: datasetId,
        query: query
      };
      var request = _helpers.buildCommandRequest.call(this, "dataset/data/deleteQuery", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.deleteDataByQuery: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "deleteDataByQuery"));
    }

    /**
     * Patches data in a dataset resource. Uses the [JSON patch](https://tools.ietf.org/html/rfc6902) format,
     * which involves defining the primary key data followed by a flexible update specification.
     * @param  {string} datasetId - The id of the dataset-based resource to update.
     * @param  {object} data - The patch definition.
     * @param  {object|array} data.__update - An array of JSON patch specifications.
     * @example <caption>patch a single value in a single document</caption>
     * tdxApi.patchData(myDatasetId, {lsoa: "E000001", __update: [{p: "count", m: "r", v: 948}]});
     * @example <caption>patch a more than one value in a single document</caption>
     * tdxApi.patchData(myDatasetId, {lsoa: "E000001", __update: [
     *   {p: "count", m: "r", v: 948}
     *   {p: "modified", m: "a", v: Date.now()}
     * ]});
     */

  }, {
    key: "patchData",
    value: function patchData(datasetId, data) {
      var postData = {
        datasetId: datasetId,
        payload: [].concat(data)
      };
      var request = _helpers.buildCommandRequest.call(this, "dataset/data/upsertMany", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.patchData: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "patchData"));
    }

    /**
     * Updates data in a dataset resource.
     * @param  {string} datasetId - The id of the dataset-based resource to update.
     * @param  {object|array} data - The data to update. Must conform to the schema defined by the resource metadata.
     * Supports updating individual or multiple documents.
     * @param  {bool} [upsert=false] - Indicates the data should be created if no document is found matching the
     * primary key.
     * @example <caption>update an existing document</caption>
     * tdxApi.updateData(myDatasetId, {lsoa: "E000001", count: 488});
     * @example <caption>upsert a document</caption>
     * // Will create a document if no data exists matching key 'lsoa': "E000004"
     * tdxApi.updateData(myDatasetId, {lsoa: "E000004", count: 288, true});
     */

  }, {
    key: "updateData",
    value: function updateData(datasetId, data, upsert) {
      var postData = {
        datasetId: datasetId,
        payload: [].concat(data),
        __upsert: !!upsert
      };
      var request = _helpers.buildCommandRequest.call(this, "dataset/data/updateMany", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.updateData: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "updateData"));
    }

    /**
     * Updates data in a dataset-based resource using a query to specify the documents to be updated.
     * @param  {string} datasetId - The id of the dataset-based resource to update data in.
     * @param  {object} query - The query that specifies the data to update. All documents matching the
     * query will be updated.
     * @example
     * // Update all documents with English lsoa.
     * tdxApi.deleteDataByQuery(myDatasetId, {lsoa: {$regex: "E*"}}, {count: 1000});
     */

  }, {
    key: "updateDataByQuery",
    value: function updateDataByQuery(datasetId, query, update) {
      var postData = {
        datasetId: datasetId,
        query: query,
        update: update
      };
      var request = _helpers.buildCommandRequest.call(this, "dataset/data/updateQuery", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.updateDataByQuery: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "updateDataByQuery"));
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
      }).then(_helpers.checkResponse.bind(null, "deleteDatabotHost"));
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
      }).then(_helpers.checkResponse.bind(null, "deleteDatabotInstance"));
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
      }).then(_helpers.checkResponse.bind(null, "getDatabotInstance"));
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
      }).then(_helpers.checkResponse.bind(null, "getDatabotInstanceOutput"));
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
      }).then(_helpers.checkResponse.bind(null, "getDatabotInstanceStatus"));
    }

    /**
     * Registers a databot host as active with the TDX.
     * @param  {object} status - The databot host identifier payload.
     */

  }, {
    key: "registerDatabotHost",
    value: function registerDatabotHost(status) {
      var request = _helpers.buildDatabotHostRequest.call(this, "register", status);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.registerDatabotHost: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "registerDatabotHost"));
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
     */

  }, {
    key: "sendDatabotHostCommand",
    value: function sendDatabotHostCommand(command, hostId, hostIp, hostPort) {
      var postData = {
        hostId: hostId,
        hostIp: hostIp,
        hostPort: hostPort,
        command: command
      };
      var request = _helpers.buildCommandRequest.call(this, "databot/host/command", postData);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.sendDatabotHostCommand: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "sendDatabotHostCommand"));
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
      }).then(_helpers.checkResponse.bind(null, "startDatabotInstance"));
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
      }).then(_helpers.checkResponse.bind(null, "stopDatabotInstance"));
    }

    /**
     * Updates a databot host status.
     * @param  {object} status - The databot host status payload.
     */

  }, {
    key: "updateDatabotHostStatus",
    value: function updateDatabotHostStatus(status) {
      var request = _helpers.buildDatabotHostRequest.call(this, "status", status);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.updateDatabotHostStatus: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "updateDatabotHostStatus"));
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
      }).then(_helpers.checkResponse.bind(null, "writeDatabotHostInstanceOutput"));
    }

    /*
     *
     *  QUERIES
     *
     */

    /**
     * Streams the contents of a resource. For dataset-based resources this will stream the dataset contents in newline
     * delimited JSON (NDJSON). For raw file resources this will stream the raw file contents (zip, raw JSON etc).
     * @param  {string} resourceId - The id of the resource to be downloaded.
     * @return {object} - Response object, where the response body is a stream object.
     */

  }, {
    key: "downloadResource",
    value: function downloadResource(resourceId) {
      var request = _helpers.buildQueryRequest.call(this, "resource/" + resourceId);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.downloadResource: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      });
    }

    /**
     * Performs an aggregate query on the given dataset, returning a response object with stream in the body
     * @param  {string} datasetId - The id of the dataset-based resource to perform the aggregate query on.
     * @param  {object|string} pipeline - The aggregate pipeline, as defined in the
     * [mongodb docs](https://docs.mongodb.com/manual/aggregation/). Can be given as a JSON object or as a stringified
     * JSON object.
     * @return  {object} - Response object, where the response body is a stream object.
     */

  }, {
    key: "getAggregateDataStream",
    value: function getAggregateDataStream(datasetId, pipeline) {
      // Convert pipeline to string if necessary.
      if (pipeline && (typeof pipeline === "undefined" ? "undefined" : _typeof(pipeline)) === "object") {
        pipeline = JSON.stringify(pipeline);
      }
      var request = _helpers.buildQueryRequest.call(this, "datasets/" + datasetId + "/aggregate?pipeline=" + pipeline);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getAggregateData: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      });
    }

    /**
     * Performs an aggregate query on the given dataset.
     * @param  {string} datasetId - The id of the dataset-based resource to perform the aggregate query on.
     * @param  {object|string} pipeline - The aggregate pipeline, as defined in the
     * [mongodb docs](https://docs.mongodb.com/manual/aggregation/). Can be given as a JSON object or as a stringified
     * JSON object.
     * @return  {DatasetData}
     */

  }, {
    key: "getAggregateData",
    value: function getAggregateData(datasetId, pipeline) {
      return this.getAggregateDataStream(datasetId, pipeline).then(_helpers.checkResponse.bind(null, "getAggregateData"));
    }

    /**
     * Gets all data from the given dataset that matches the filter provided and returns a response object with stream
     * in the body.
     * @param  {string} datasetId - The id of the dataset-based resource.
     * @param  {object} [filter] - A mongodb filter object. If omitted, all data will be retrieved.
     * @param  {object} [projection] - A mongodb projection object. Should be used to restrict the payload to the
     * minimum properties needed if a lot of data is being retrieved.
     * @param  {object} [options] - A mongodb options object. Can be used to limit, skip, sort etc. Note a default
     * `limit` of 1000 is applied if none is given here.
     * @param  {bool} [options.nqmMeta] - When set, the resource metadata will be returned along with the dataset
     * data. Can be used to avoid a second call to `getResource`. Otherwise a URL to the metadata is provided.
     * @return  {object} - Response object, where the response body is a stream object.
     */

  }, {
    key: "getDatasetDataStream",
    value: function getDatasetDataStream(datasetId, filter, projection, options) {
      var request = _helpers.buildQueryRequest.call(this, "datasets/" + datasetId + "/data", filter, projection, options);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getDatasetDataStream: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      });
    }

    /**
     * Gets all data from the given dataset that matches the filter provided.
     * @param  {string} datasetId - The id of the dataset-based resource.
     * @param  {object} [filter] - A mongodb filter object. If omitted, all data will be retrieved.
     * @param  {object} [projection] - A mongodb projection object. Should be used to restrict the payload to the
     * minimum properties needed if a lot of data is being retrieved.
     * @param  {object} [options] - A mongodb options object. Can be used to limit, skip, sort etc. Note a default
     * `limit` of 1000 is applied if none is given here.
     * @param  {bool} [options.nqmMeta] - When set, the resource metadata will be returned along with the dataset
     * data. Can be used to avoid a second call to `getResource`. Otherwise a URL to the metadata is provided.
     * @return  {DatasetData}
     */

  }, {
    key: "getDatasetData",
    value: function getDatasetData(datasetId, filter, projection, options) {
      return this.getDatasetDataStream(datasetId, filter, projection, options).then(_helpers.checkResponse.bind(null, "getDatasetData"));
    }

    /**
     * Gets a count of the data in a dataset-based resource, after applying the given filter.
     * @param  {string} datasetId - The id of the dataset-based resource.
     * @param  {object} [filter] - An optional mongodb filter to apply before counting the data.
     */

  }, {
    key: "getDatasetDataCount",
    value: function getDatasetDataCount(datasetId, filter) {
      var request = _helpers.buildQueryRequest.call(this, "datasets/" + datasetId + "/count", filter);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getDatasetDataCount: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "getDatasetDataCount"));
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
      var request = _helpers.buildQueryRequest.call(this, "datasets/" + datasetId + "/distinct?key=" + key, filter, projection, options); // eslint-disable-line max-len
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getDistinct: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "getDistinct"));
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
            return (0, _helpers.checkResponse)("getResource", response);
          }
        } else {
          return (0, _helpers.checkResponse)("getResource", response);
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
      var request = _helpers.buildQueryRequest.call(this, "resources/" + resourceId + "/access", filter, projection, options);
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getResourceAccess: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(function (response) {
        return (0, _helpers.checkResponse)("getResourceAccess", response);
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
      var request = _helpers.buildQueryRequest.call(this, "datasets/" + resourceId + "/ancestors");
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getDatasetAncestors: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "getResourceAncestors"));
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
      }).then(_helpers.checkResponse.bind(null, "getResources"));
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
      }).then(_helpers.checkResponse.bind(null, "getTDXToken"));
    }

    /**
     * Gets the details for a given zone (account) id.
     * @param  {string} accountId - the id of the zone to be retrieved.
     * @return  {Zone} zone
     */

  }, {
    key: "getZone",
    value: function getZone(accountId) {
      var request = _helpers.buildQueryRequest.call(this, "zones", { username: accountId });
      return _helpers.fetchWithDeadline.call(this, request).catch(function (err) {
        errLog("TDXApi.getZone: %s", err.message);
        return Promise.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "getZone"));
    }
  }]);

  return TDXApi;
}();

exports.default = TDXApi;
module.exports = exports["default"];

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ })
/******/ ]);
});
//# sourceMappingURL=nqm-api-tdx.js.map