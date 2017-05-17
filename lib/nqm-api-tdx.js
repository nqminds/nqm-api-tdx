(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("bluebird"), require("debug"), require("base-64"), require("isomorphic-fetch"));
	else if(typeof define === 'function' && define.amd)
		define("nqm-api-tdx", ["bluebird", "debug", "base-64", "isomorphic-fetch"], factory);
	else if(typeof exports === 'object')
		exports["nqm-api-tdx"] = factory(require("bluebird"), require("debug"), require("base-64"), require("isomorphic-fetch"));
	else
		root["nqm-api-tdx"] = factory(root["bluebird"], root["debug"], root["base-64"], root["isomorphic-fetch"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TDXApiError = exports.setDefaults = exports.handleError = exports.checkResponse = undefined;

var _bluebird = __webpack_require__(0);

var _bluebird2 = _interopRequireDefault(_bluebird);

var _debug = __webpack_require__(1);

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TDXApiError = function TDXApiError(message, stack) {
  this.name = "TDXApiError";
  this.message = message || "no message given";
  this.stack = stack || new Error().stack;
};

TDXApiError.prototype = Object.create(Error.prototype);
TDXApiError.prototype.constructor = TDXApiError;

var handleError = function handleError(source, err) {
  var code = typeof err.code === "undefined" ? "n/a" : err.code;
  var message = err.response ? err.response.text || err.message : err.message;
  var internal = {
    name: "TDXApiError",
    from: source,
    failure: message,
    stack: err.stack,
    code: code
  };
  return new TDXApiError(JSON.stringify(internal), err.stack);
};

var checkResponse = function checkResponse(source, response) {
  return response.json().then(function (json) {
    if (response.ok) {
      return _bluebird2.default.resolve(json);
    } else {
      if (json.error) {
        // TODO  - test
        debugger; // eslint-disable-line no-debugger
        return _bluebird2.default.reject(handleError(source, { message: json.error }));
      } else {
        return _bluebird2.default.reject(handleError(source, json));
      }
    }
  });
};

var setDefaults = function setDefaults(config) {
  var log = (0, _debug2.default)("nqm-api-tdx:setDefaults");
  if (config.tdxHost && (!config.queryHost || !config.commandHost)) {
    var protocolComponents = config.tdxHost.split("://");
    if (protocolComponents.length !== 2) {
      throw new Error("invalid tdxHost in config - no protocol: " + config.tdxHost);
    }
    var protocol = protocolComponents[0];
    var hostComponents = protocolComponents[1].split(".");
    if (hostComponents.length < 3) {
      throw new Error("invalid tdxHost in config - expected sub.domain.tld: " + config.tdxHost);
    }
    var hostname = hostComponents.slice(1).join(".");
    config.commandHost = config.commandHost || protocol + "://cmd." + hostname;
    config.queryHost = config.queryHost || protocol + "://q." + hostname;
    config.databotHost = config.databotHost || protocol + "://databot." + hostname;
    log("defaulted hosts to %s, %s, %s", config.commandHost, config.queryHost, config.databotHost);
  }
};

exports.checkResponse = checkResponse;
exports.handleError = handleError;
exports.setDefaults = setDefaults;
exports.TDXApiError = TDXApiError;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bluebird = __webpack_require__(0);

var _bluebird2 = _interopRequireDefault(_bluebird);

var _isomorphicFetch = __webpack_require__(4);

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _base = __webpack_require__(3);

var _base2 = _interopRequireDefault(_base);

var _debug = __webpack_require__(1);

var _debug2 = _interopRequireDefault(_debug);

var _helpers = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = (0, _debug2.default)("nqm-api-tdx");
var errLog = (0, _debug2.default)("nqm-api-tdx:error");

var pollingRetries = 15;
var pollingInterval = 1000;
var waitInfinitely = -1;

var TDXApi = function () {
  function TDXApi(config) {
    _classCallCheck(this, TDXApi);

    this.config = config;
    this.accessToken = config.accessToken || "";
    (0, _helpers.setDefaults)(this.config);
  }

  _createClass(TDXApi, [{
    key: "buildCommandRequest",
    value: function buildCommandRequest(command, data) {
      return new Request(this.config.commandHost + "/commandSync/" + command, {
        method: "POST",
        mode: "cors",
        headers: new Headers({
          "Authorization": "Bearer " + this.accessToken,
          "Content-Type": "application/json"
        }),
        body: JSON.stringify(data)
      });
    }
  }, {
    key: "buildQueryRequest",
    value: function buildQueryRequest(method, filter, projection, options) {
      filter = filter ? JSON.stringify(filter) : "";
      projection = projection ? JSON.stringify(projection) : "";
      options = options ? JSON.stringify(options) : "";
      var query = method + "?filter=" + filter + "&proj=" + projection + "&opts=" + options;
      return new Request(this.config.queryHost + "/v1/" + query, {
        method: "GET",
        mode: "cors",
        headers: new Headers({
          "Authorization": "Bearer " + this.accessToken,
          "Content-Type": "application/json"
        })
      });
    }
  }, {
    key: "authenticate",
    value: function authenticate(id, secret) {
      var _this = this;

      var credentials = void 0;

      if (secret === undefined) {
        // Assume the first argument is a pre-formed credentials string
        credentials = id;
      } else {
        // uri-encode the username and concatenate with secret.
        credentials = encodeURIComponent(id) + ":" + secret;
      }

      // Authorization headers must be base-64 encoded.
      credentials = _base2.default.encode(credentials);

      var uri = (this.config.tdxHost || this.config.commandHost || this.config.queryHost) + "/token";
      var request = new Request(uri, {
        method: "POST",
        mode: "cors",
        headers: new Headers({
          "Authorization": "Basic " + credentials,
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ grant_type: "client_credentials", ttl: this.config.accessTokenTTL || 3600 })
      });

      return (0, _isomorphicFetch2.default)(request).then(_helpers.checkResponse.bind(null, "authenticate")).then(function (result) {
        log(result);
        _this.accessToken = result.access_token;
        return _this.accessToken;
      }).catch(function (err) {
        errLog("error: " + err.message);
        return _bluebird2.default.reject(err);
      });
    }
    /*
     *
     *  COMMANDS
     *
     */

  }, {
    key: "addAccount",
    value: function addAccount(options) {
      var request = this.buildCommandRequest("account/create", options);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.addAccount: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "addAccount"));
    }
  }, {
    key: "addTrustedExchange",
    value: function addTrustedExchange(options) {
      var request = this.buildCommandRequest("trustedConnection/create", options);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.addTrustedExchange: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "addTrustedExchange"));
    }
  }, {
    key: "addResource",
    value: function addResource(options, wait) {
      var _this2 = this;

      var request = this.buildCommandRequest("resource/create", options);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.addResource: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "addResource")).then(function (result) {
        if (wait) {
          return _this2.waitForIndex(result.response.id).then(function () {
            return result;
          });
        } else {
          return result;
        }
      });
    }
  }, {
    key: "updateResource",
    value: function updateResource(resourceId, update) {
      var request = this.buildCommandRequest("resource/update", _extends({ id: resourceId }, update));
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.updateResource: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "updateResource"));
    }
  }, {
    key: "deleteResource",
    value: function deleteResource(resourceId) {
      var request = this.buildCommandRequest("resource/delete", { id: resourceId });
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.deleteResource: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "deleteResource"));
    }
  }, {
    key: "addResourceAccess",
    value: function addResourceAccess(resourceId, accountId, sourceId, access) {
      var request = this.buildCommandRequest("resourceAccess/add", {
        rid: resourceId,
        aid: accountId,
        src: sourceId,
        acc: access
      });
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.addResourceAccess: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "addResourceAccess"));
    }
  }, {
    key: "removeResourceAccess",
    value: function removeResourceAccess(resourceId, accountId, addedBy, sourceId, access) {
      var request = this.buildCommandRequest("resourceAccess/delete", {
        rid: resourceId,
        aid: accountId,
        by: addedBy,
        src: sourceId,
        acc: access
      });
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.removeResourceAccess: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "removeResourceAccess"));
    }
  }, {
    key: "setResourceShareMode",
    value: function setResourceShareMode(resourceId, shareMode) {
      var request = this.buildCommandRequest("resource/setShareMode", { id: resourceId, shareMode: shareMode });
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.setResourceShareMode: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "setResourceShareMode"));
    }
  }, {
    key: "setResourcePermissiveShare",
    value: function setResourcePermissiveShare(resourceId, allowPermissive) {
      var request = this.buildCommandRequest("resource/setPermissiveShare", {
        id: resourceId,
        permissiveShare: allowPermissive ? "r" : ""
      });
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.setResourcePermissiveShare: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "setResourcePermissiveShare"));
    }
  }, {
    key: "updateData",
    value: function updateData(datasetId, data, upsert) {
      var postData = {
        datasetId: datasetId,
        payload: [].concat(data),
        __upsert: !!upsert
      };
      var request = this.buildCommandRequest("dataset/data/updateMany", postData);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.updateData: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "updateData"));
    }
  }, {
    key: "patchData",
    value: function patchData(datasetId, data) {
      var postData = {
        datasetId: datasetId,
        payload: [].concat(data)
      };
      var request = this.buildCommandRequest("dataset/data/upsertMany", postData);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.patchData: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "patchData"));
    }
  }, {
    key: "deleteData",
    value: function deleteData(datasetId, data) {
      var postData = _extends({
        datasetId: datasetId
      }, data);
      var request = this.buildCommandRequest("dataset/data/delete", postData);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.deleteData: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "deleteData"));
    }
    /*
     *
     *  QUERIES
     *
     */

  }, {
    key: "getZone",
    value: function getZone(zoneId) {
      var request = this.buildQueryRequest("zones", { username: zoneId });
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.getZone: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "getZone"));
    }
  }, {
    key: "getResource",
    value: function getResource(resourceId) {
      var request = this.buildQueryRequest("resources/" + resourceId);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.getResource: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "getResource"));
    }
  }, {
    key: "getResources",
    value: function getResources(filter, projection, options) {
      var request = this.buildQueryRequest("resources", filter, projection, options);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.getResource: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "getResources"));
    }
  }, {
    key: "getResourcesWithSchema",
    value: function getResourcesWithSchema(schemaId) {
      var filter = { "schemaDefinition.parent": schemaId };
      return this.getResources(filter);
    }
  }, {
    key: "getResourceAncestors",
    value: function getResourceAncestors(resourceId) {
      var request = this.buildQueryRequest("datasets/" + resourceId + "/ancestors");
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.getDatasetAncestors: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "getResourceAncestors"));
    }
  }, {
    key: "getDatasetData",
    value: function getDatasetData(datasetId, filter, projection, options) {
      var request = this.buildQueryRequest("datasets/" + datasetId + "/data", filter, projection, options);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.getDatasetData: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "getDatasetData"));
    }
  }, {
    key: "getDatasetDataCount",
    value: function getDatasetDataCount(datasetId, filter) {
      var request = this.buildQueryRequest("datasets/" + datasetId + "/count", filter);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        errLog("TDXApi.getDatasetDataCount: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(_helpers.checkResponse.bind(null, "getDatasetDataCount"));
    }
  }, {
    key: "waitForResource",
    value: function waitForResource(resourceId, check, retryCount, maxRetries) {
      var _this3 = this;

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
            log("waitForResource - giving up after %d attempts", retryCount);
            return _bluebird2.default.reject(new Error("gave up waiting for " + resourceId + " after " + retryCount + " attempts"));
          }

          // Try again after a delay.
          log("waitForResource - waiting for %d msec", pollingInterval);
          return _bluebird2.default.delay(pollingInterval).then(function () {
            return _this3.waitForResource(resourceId, check, retryCount + 1, maxRetries);
          });
        } else {
          return resource;
        }
      }).catch(function (err) {
        debugger; // eslint-disable-line no-debugger
        if (err.name !== "TDXApiError") {
          return _bluebird2.default.reject(err);
        } else {
          try {
            var parseError = JSON.parse(err.message);
            var failure = JSON.parse(parseError.failure);
            if (failure.code === "NotFoundError" || failure.code === "UnauthorizedError") {
              // Ignore resource not found and not authorized errors here, they are probably caused by
              // waiting for the projections to catch up (esp. in debug environments) by falling through
              // we will still be limited by the retry count, so won't loop forever.
              log("waitForResource - ignoring error %s", err.message);
              return _bluebird2.default.delay(pollingInterval).then(function () {
                return _this3.waitForResource(resourceId, check, retryCount + 1, maxRetries);
              });
            } else {
              // All other errors are fatal.
              return _bluebird2.default.reject(err);
            }
          } catch (parseEx) {
            // Failed to parse TDX error - re-throw the original error.
            return _bluebird2.default.reject(err);
          }
        }
      });
    }
  }, {
    key: "waitForIndex",
    value: function waitForIndex(datasetId, status, maxRetries) {
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

      return this.waitForResource(datasetId, builtIndexCheck, 0, maxRetries);
    }
  }]);

  return TDXApi;
}();

exports.default = TDXApi;
module.exports = exports["default"];

/***/ })
/******/ ]);
});
//# sourceMappingURL=nqm-api-tdx.js.map