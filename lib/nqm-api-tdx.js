(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("bluebird"), require("isomorphic-fetch"));
	else if(typeof define === 'function' && define.amd)
		define("nqm-api-tdx", ["bluebird", "isomorphic-fetch"], factory);
	else if(typeof exports === 'object')
		exports["nqm-api-tdx"] = factory(require("bluebird"), require("isomorphic-fetch"));
	else
		root["nqm-api-tdx"] = factory(root["bluebird"], root["isomorphic-fetch"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_1__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-disable no-console */


var _bluebird = __webpack_require__(0);

var _bluebird2 = _interopRequireDefault(_bluebird);

var _isomorphicFetch = __webpack_require__(1);

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var checkResponse = function checkResponse(response) {
  return response.json().then(function (json) {
    if (response.ok) {
      return json;
    } else {
      return _bluebird2.default.reject(new Error(json.error || JSON.stringify(json)));
    }
  });
};

var setDefaults = function setDefaults(config) {
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
    console.log("defaulted hosts to %s, %s, %s", config.commandHost, config.queryHost, config.databotHost);
  }
};

var pollingRetries = 15;
var pollingInterval = 1000;
var waitInfinitely = -1;

var TDXApi = function () {
  function TDXApi(config) {
    _classCallCheck(this, TDXApi);

    this.config = config;
    this.accessToken = config.accessToken || "";

    setDefaults(this.config);
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
    value: function authenticate(token, secret) {
      var _this = this;

      var credentials = void 0;
      if (secret === undefined) {
        credentials = token;
      } else {
        credentials = token + ":" + secret;
      }

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

      return (0, _isomorphicFetch2.default)(request).then(checkResponse).then(function (result) {
        console.log(result);
        _this.accessToken = result.access_token;
        return _this.accessToken;
      }).catch(function (err) {
        console.log("error: " + err.message);
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
        console.error("TDXApi.addAccount: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
    }
  }, {
    key: "addTrustedExchange",
    value: function addTrustedExchange(options) {
      var request = this.buildCommandRequest("trustedConnection/create", options);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        console.error("TDXApi.addTrustedExchange: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
    }
  }, {
    key: "addResource",
    value: function addResource(options) {
      var request = this.buildCommandRequest("resource/create", options);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        console.error("TDXApi.addResource: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
    }
  }, {
    key: "deleteResource",
    value: function deleteResource(resourceId) {
      var request = this.buildCommandRequest("resource/delete", { id: resourceId });
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        console.error("TDXApi.deleteResource: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
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
        console.error("TDXApi.addResourceAccess: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
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
        console.error("TDXApi.removeResourceAccess: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
    }
  }, {
    key: "setResourceShareMode",
    value: function setResourceShareMode(resourceId, shareMode) {
      var request = this.buildCommandRequest("resource/setShareMode", { id: resourceId, shareMode: shareMode });
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        console.error("TDXApi.setResourceShareMode: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
    }
  }, {
    key: "setResourcePermissiveShare",
    value: function setResourcePermissiveShare(resourceId, allowPermissive) {
      var request = this.buildCommandRequest("resource/setPermissiveShare", {
        id: resourceId,
        permissiveShare: allowPermissive ? "r" : ""
      });
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        console.error("TDXApi.setResourcePermissiveShare: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
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
        console.error("TDXApi.updateData: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
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
        console.error("TDXApi.patchData: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
    }
  }, {
    key: "deleteData",
    value: function deleteData(datasetId, data) {
      var postData = _extends({
        datasetId: datasetId
      }, data);
      var request = this.buildCommandRequest("dataset/data/delete", postData);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        console.error("TDXApi.deleteData: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
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
        console.error("TDXApi.getZone: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
    }
  }, {
    key: "getResource",
    value: function getResource(resourceId) {
      var request = this.buildQueryRequest("datasets/" + resourceId);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        console.error("TDXApi.getResource: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
    }
  }, {
    key: "getDatasetAncestors",
    value: function getDatasetAncestors(datasetId) {
      var request = this.buildQueryRequest("datasets/" + datasetId + "/ancestors");
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        console.error("TDXApi.getDatasetAncestors: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
    }
  }, {
    key: "getDatasetData",
    value: function getDatasetData(datasetId, filter, projection, options) {
      var request = this.buildQueryRequest("datasets/" + datasetId + "/data", filter, projection, options);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        console.error("TDXApi.getDatasetData: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
    }
  }, {
    key: "getDatasetDataCount",
    value: function getDatasetDataCount(datasetId, filter) {
      var request = this.buildQueryRequest("datasets/" + datasetId + "/count", filter);
      return (0, _isomorphicFetch2.default)(request).catch(function (err) {
        console.error("TDXApi.getDatasetDataCount: %s", err.message);
        return _bluebird2.default.reject(new Error(err.message + " - [network error]"));
      }).then(checkResponse);
    }
  }, {
    key: "waitForResource",
    value: function waitForResource(datasetId, check, retryCount, maxRetries) {
      var _this2 = this;

      retryCount = retryCount || 0;
      return this.getDataset(datasetId).then(function (dataset) {
        var checkResult = check(dataset, retryCount);
        if (checkResult instanceof Error) {
          console.log("waitForResource - check failed with error [%s]", checkResult.message);
          return _bluebird2.default.reject(checkResult);
        }

        if (!checkResult) {
          // A negative maxRetries value will retry indefinitely.
          if (maxRetries >= 0 && retryCount > maxRetries) {
            console.log("waitForResource - giving up after %d attempts", retryCount);
            return _bluebird2.default.reject(new Error("gave up waiting for " + datasetId + " after " + retryCount + " attempts"));
          }

          // Try again after a delay.
          console.log("waitForResource - waiting for %d msec", pollingInterval);
          return _bluebird2.default.delay(pollingInterval).then(function () {
            return _this2.waitForResource(datasetId, check, retryCount + 1, maxRetries);
          });
        } else {
          return dataset;
        }
      }).catch(function (err) {
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
              console.log("waitForResource - ignoring error %s", err.message);
              return _bluebird2.default.delay(pollingInterval).then(function () {
                return _this2.waitForResource(datasetId, check, retryCount + 1, maxRetries);
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
        console.log("builtIndexCheck: %s", dataset ? dataset.indexStatus : "no dataset");

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