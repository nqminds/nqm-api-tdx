import Promise from "bluebird";
import fetch from "isomorphic-fetch";
import base64 from "base-64";
import debug from "debug";
import {setDefaults, checkResponse} from "./helpers";

const log = debug("nqm-api-tdx");
const errLog = debug("nqm-api-tdx:error");

const pollingRetries = 15;
const pollingInterval = 1000;
const waitInfinitely = -1;

class TDXApi {
  constructor(config) {
    this.config = config;
    this.accessToken = config.accessToken || "";
    setDefaults(this.config);
  }
  buildCommandRequest(command, data, contentType) {
    contentType = contentType || "application/json";
    return new Request(`${this.config.commandHost}/commandSync/${command}`, {
      method: "POST",
      mode: "cors",
      headers: new Headers({
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": contentType,
      }),
      body: JSON.stringify(data),
    });
  }
  buildQueryRequest(prefix, filter, projection, options) {
    filter = filter ? JSON.stringify(filter) : "";
    projection = projection ? JSON.stringify(projection) : "";
    options = options ? JSON.stringify(options) : "";
    let query;
    if (prefix.indexOf("?") < 0) {
      // There is no query portion in the prefix - add one now.
      query = `${prefix}?filter=${filter}&proj=${projection}&opts=${options}`;
    } else {
      // There is already a query portion, so append the params.
      query = `${prefix}&filter=${filter}&proj=${projection}&opts=${options}`;
    }
    return new Request(`${this.config.queryHost}${query}`, {
      method: "GET",
      mode: "cors",
      headers: new Headers({
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      }),
    });
  }
  authenticate(id, secret) {
    let credentials;

    if (secret === undefined) {
      // Assume the first argument is a pre-formed credentials string
      credentials = id;
    } else {
      // uri-encode the username and concatenate with secret.
      credentials = `${encodeURIComponent(id)}:${secret}`;
    }

    // Authorization headers must be base-64 encoded.
    credentials = base64.encode(credentials);

    const uri = `${this.config.tdxHost || this.config.commandHost || this.config.queryHost}/token`;
    const request = new Request(uri, {
      method: "POST",
      mode: "cors",
      headers: new Headers({
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({grant_type: "client_credentials", ttl: this.config.accessTokenTTL || 3600}),
    });

    return fetch(request)
      .then(checkResponse.bind(null, "authenticate"))
      .then((result) => {
        log(result);
        this.accessToken = result.access_token;
        return this.accessToken;
      })
      .catch((err) => {
        errLog(`error: ${err.message}`);
        return Promise.reject(err);
      });
  }
  /*
   *
   *  COMMANDS
   *
   */
  addAccount(options) {
    const request = this.buildCommandRequest("account/create", options);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.addAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "addAccount"));
  }
  updateAccount(username, options) {
    const request = this.buildCommandRequest("account/update", {username, ...options});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.updateAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "addAccount"));
  }
  approveAccount(username, approved) {
    const request = this.buildCommandRequest("account/approve", {username, approved});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.approveAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "approveAccount"));
  }
  resetAccount(username, key) {
    const request = this.buildCommandRequest("account/reset", {username, key});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.resetAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "resetAccount"));
  }
  verifyAccount(username, verified) {
    const request = this.buildCommandRequest("account/verify", {username, verified});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.verifyAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "verifyAccount"));
  }
  addTrustedExchange(options) {
    const request = this.buildCommandRequest("trustedConnection/create", options);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.addTrustedExchange: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "addTrustedExchange"));
  }
  addResource(options, wait) {
    const request = this.buildCommandRequest("resource/create", options);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.addResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "addResource"))
      .then((result) => {
        if (wait) {
          return this.waitForIndex(result.response.id)
            .then(() => {
              return result;
            });
        } else {
          return result;
        }
      });
  }
  updateResource(resourceId, update) {
    const request = this.buildCommandRequest("resource/update", {id: resourceId, ...update});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.updateResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "updateResource"));
  }
  moveResource(id, fromParentId, toParentId) {
    const request = this.buildCommandRequest("resource/move", {id, fromParentId, toParentId});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.moveResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "moveResource"));
  }
  deleteResource(resourceId) {
    const request = this.buildCommandRequest("resource/delete", {id: resourceId});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.deleteResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "deleteResource"));
  }
  rebuildResourceIndex(resourceId) {
    const request = this.buildCommandRequest("resource/index/rebuild", {id: resourceId});
    let result;
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.rebuildResourceIndex: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "rebuildIndex"))
      .then((res) => {
        result = res;
        return this.waitForIndex(result.response.id, "built");
      })
      .then(() => {
        return result;
      });
  }
  suspendResourceIndex(resourceId) {
    const request = this.buildCommandRequest("resource/index/suspend", {id: resourceId});
    let result;
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.suspendResourceIndex: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "suspendIndex"))
      .then((res) => {
        result = res;
        return this.waitForIndex(result.response.id, "suspended");
      })
      .then(() => {
        return result;
      });
  }
  addResourceAccess(resourceId, accountId, sourceId, access) {
    const request = this.buildCommandRequest("resourceAccess/add", {
      rid: resourceId,
      aid: accountId,
      src: sourceId,
      acc: access,
    });
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.addResourceAccess: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "addResourceAccess"));
  }
  removeResourceAccess(resourceId, accountId, addedBy, sourceId, access) {
    const request = this.buildCommandRequest("resourceAccess/delete", {
      rid: resourceId,
      aid: accountId,
      by: addedBy,
      src: sourceId,
      acc: access,
    });
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.removeResourceAccess: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "removeResourceAccess"));
  }
  setResourceShareMode(resourceId, shareMode) {
    const request = this.buildCommandRequest("resource/setShareMode", {id: resourceId, shareMode});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.setResourceShareMode: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "setResourceShareMode"));
  }
  setResourcePermissiveShare(resourceId, allowPermissive) {
    const request = this.buildCommandRequest("resource/setPermissiveShare", {
      id: resourceId,
      permissiveShare: allowPermissive ? "r" : "",
    });
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.setResourcePermissiveShare: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "setResourcePermissiveShare"));
  }
  truncateResource(resourceId) {
    const request = this.buildCommandRequest("resource/truncate", {id: resourceId});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.truncateResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "truncateResource"));
  }
  addData(datasetId, data) {
    const postData = {
      datasetId,
      payload: [].concat(data),
    };
    const request = this.buildCommandRequest("dataset/data/createMany", postData);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.createData: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "updateData"));
  }
  updateData(datasetId, data, upsert) {
    const postData = {
      datasetId,
      payload: [].concat(data),
      __upsert: !!upsert,
    };
    const request = this.buildCommandRequest("dataset/data/updateMany", postData);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.updateData: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "updateData"));
  }
  patchData(datasetId, data) {
    const postData = {
      datasetId,
      payload: [].concat(data),
    };
    const request = this.buildCommandRequest("dataset/data/upsertMany", postData);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.patchData: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "patchData"));
  }
  deleteData(datasetId, data) {
    const postData = {
      datasetId,
      ...data,
    };
    const request = this.buildCommandRequest("dataset/data/delete", postData);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.deleteData: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "deleteData"));
  }
  deleteDataByQuery(datasetId, query) {
    const postData = {
      datasetId,
      query,
    };
    const request = this.buildCommandRequest("dataset/data/deleteQuery", postData);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.deleteDataByQuery: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "deleteDataByQuery"));
  }
  fileUpload(resourceId, file) {
    const postData = new FormData();
    postData.append("file", file);

    const request = new Request(`${this.config.commandHost}/commandSync/resource/${resourceId}/upload`, {
      method: "POST",
      mode: "cors",
      headers: new Headers({
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Disposition": `attachment; filename=\"${file.name}\"`,
      }),
      body: postData,
    });

    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.fileUpload: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "fileUpload"));
  }
  /*
   *
   *  QUERIES
   *
   */
  getZone(zoneId) {
    const request = this.buildQueryRequest("zones", {username: zoneId});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.getZone: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getZone"));
  }
  getResource(resourceId) {
    const request = this.buildQueryRequest(`resources/${resourceId}`);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.getResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getResource"));
  }
  getResources(filter, projection, options) {
    const request = this.buildQueryRequest("resources", filter, projection, options);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.getResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getResources"));
  }
  getResourcesWithSchema(schemaId) {
    const filter = {"schemaDefinition.parent": schemaId};
    return this.getResources(filter);
  }
  getResourceAncestors(resourceId) {
    const request = this.buildQueryRequest(`datasets/${resourceId}/ancestors`);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.getDatasetAncestors: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getResourceAncestors"));
  }
  getDatasetData(datasetId, filter, projection, options) {
    const request = this.buildQueryRequest(`datasets/${datasetId}/data`, filter, projection, options);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.getDatasetData: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getDatasetData"));
  }
  getDatasetDataCount(datasetId, filter) {
    const request = this.buildQueryRequest(`datasets/${datasetId}/count`, filter);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.getDatasetDataCount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getDatasetDataCount"));
  }
  getDistinct(datasetId, key, filter, projection, options) {
    const request = this.buildQueryRequest(`datasets/${datasetId}/distinct?key=${key}`, filter, projection, options);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.getDistinct: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getDatasetData"));
  }
  waitForResource(resourceId, check, retryCount, maxRetries) {
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
            log("waitForResource - giving up after %d attempts", retryCount);
            return Promise.reject(new Error(`gave up waiting for ${resourceId} after ${retryCount} attempts`));
          }

          // Try again after a delay.
          log("waitForResource - waiting for %d msec", pollingInterval);
          return Promise.delay(pollingInterval)
            .then(() => {
              return this.waitForResource(resourceId, check, retryCount + 1, maxRetries);
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
              log("waitForResource - ignoring error %s", err.message);
              return Promise.delay(pollingInterval)
                .then(() => {
                  return this.waitForResource(resourceId, check, retryCount + 1, maxRetries);
                });
            } else {
              // All other errors are fatal.
              return Promise.reject(err);
            }
          } catch (parseEx) {
            // Failed to parse TDX error - re-throw the original error.
            return Promise.reject(err);
          }
        }
      });
  }
  waitForIndex(datasetId, status, maxRetries) {
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

    return this.waitForResource(datasetId, builtIndexCheck, 0, maxRetries);
  }
}

export default TDXApi;
