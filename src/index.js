/* eslint-disable no-console */
import Promise from "bluebird";
import fetch from "isomorphic-fetch";
import base64 from "base-64";

const checkResponse = function(response) {
  return response.json()
    .then((json) => {
      if (response.ok) {
        return json;
      } else {
        return Promise.reject(new Error(json.error || JSON.stringify(json)));
      }
    });
};

const setDefaults = function(config) {
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
    config.queryHost = config.queryHost || `${protocol}://q.${hostname}`;
    config.databotHost = config.databotHost || `${protocol}://databot.${hostname}`;
    console.log(
      "defaulted hosts to %s, %s, %s",
      config.commandHost,
      config.queryHost,
      config.databotHost
    );
  }
};

const pollingRetries = 15;
const pollingInterval = 1000;
const waitInfinitely = -1;

class TDXApi {
  constructor(config) {
    this.config = config;
    this.accessToken = config.accessToken || "";

    setDefaults(this.config);
  }
  buildCommandRequest(command, data) {
    return new Request(`${this.config.commandHost}/commandSync/${command}`, {
      method: "POST",
      mode: "cors",
      headers: new Headers({
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });
  }
  buildQueryRequest(method, filter, projection, options) {
    filter = filter ? JSON.stringify(filter) : "";
    projection = projection ? JSON.stringify(projection) : "";
    options = options ? JSON.stringify(options) : "";
    const query = `${method}?filter=${filter}&proj=${projection}&opts=${options}`;
    return new Request(`${this.config.queryHost}/v1/${query}`, {
      method: "GET",
      mode: "cors",
      headers: new Headers({
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      }),
    });
  }
  authenticate(token, secret) {
    let credentials;

    if (secret === undefined) {
      // Assume the first argument is a pre-formed credentials string
      credentials = token;
    } else {
      // uri-encode the username and concatenate with secret.
      credentials = `${encodeURIComponent(token)}:${secret}`;
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
      .then(checkResponse)
      .then((result) => {
        console.log(result);
        this.accessToken = result.access_token;
        return this.accessToken;
      })
      .catch((err) => {
        console.log(`error: ${err.message}`);
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
        console.error("TDXApi.addAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
  }
  addTrustedExchange(options) {
    const request = this.buildCommandRequest("trustedConnection/create", options);
    return fetch(request)
      .catch((err) => {
        console.error("TDXApi.addTrustedExchange: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
  }
  addResource(options) {
    const request = this.buildCommandRequest("resource/create", options);
    return fetch(request)
      .catch((err) => {
        console.error("TDXApi.addResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
  }
  deleteResource(resourceId) {
    const request = this.buildCommandRequest("resource/delete", {id: resourceId});
    return fetch(request)
      .catch((err) => {
        console.error("TDXApi.deleteResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
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
        console.error("TDXApi.addResourceAccess: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
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
        console.error("TDXApi.removeResourceAccess: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
  }
  setResourceShareMode(resourceId, shareMode) {
    const request = this.buildCommandRequest("resource/setShareMode", {id: resourceId, shareMode});
    return fetch(request)
      .catch((err) => {
        console.error("TDXApi.setResourceShareMode: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
  }
  setResourcePermissiveShare(resourceId, allowPermissive) {
    const request = this.buildCommandRequest("resource/setPermissiveShare", {
      id: resourceId,
      permissiveShare: allowPermissive ? "r" : "",
    });
    return fetch(request)
      .catch((err) => {
        console.error("TDXApi.setResourcePermissiveShare: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
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
        console.error("TDXApi.updateData: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
  }
  patchData(datasetId, data) {
    const postData = {
      datasetId,
      payload: [].concat(data),
    };
    const request = this.buildCommandRequest("dataset/data/upsertMany", postData);
    return fetch(request)
      .catch((err) => {
        console.error("TDXApi.patchData: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
  }
  deleteData(datasetId, data) {
    const postData = {
      datasetId,
      ...data,
    };
    const request = this.buildCommandRequest("dataset/data/delete", postData);
    return fetch(request)
      .catch((err) => {
        console.error("TDXApi.deleteData: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
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
        console.error("TDXApi.getZone: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
  }
  getResource(resourceId) {
    const request = this.buildQueryRequest(`datasets/${resourceId}`);
    return fetch(request)
      .catch((err) => {
        console.error("TDXApi.getResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
  }
  getDatasetAncestors(datasetId) {
    const request = this.buildQueryRequest(`datasets/${datasetId}/ancestors`);
    return fetch(request)
      .catch((err) => {
        console.error("TDXApi.getDatasetAncestors: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
  }
  getDatasetData(datasetId, filter, projection, options) {
    const request = this.buildQueryRequest(`datasets/${datasetId}/data`, filter, projection, options);
    return fetch(request)
      .catch((err) => {
        console.error("TDXApi.getDatasetData: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
  }
  getDatasetDataCount(datasetId, filter) {
    const request = this.buildQueryRequest(`datasets/${datasetId}/count`, filter);
    return fetch(request)
      .catch((err) => {
        console.error("TDXApi.getDatasetDataCount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse);
  }
  waitForResource(datasetId, check, retryCount, maxRetries) {
    retryCount = retryCount || 0;
    return this.getDataset(datasetId)
      .then((dataset) => {
        const checkResult = check(dataset, retryCount);
        if (checkResult instanceof Error) {
          console.log("waitForResource - check failed with error [%s]", checkResult.message);
          return Promise.reject(checkResult);
        }

        if (!checkResult) {
          // A negative maxRetries value will retry indefinitely.
          if (maxRetries >= 0 && retryCount > maxRetries) {
            console.log("waitForResource - giving up after %d attempts", retryCount);
            return Promise.reject(new Error(`gave up waiting for ${datasetId} after ${retryCount} attempts`));
          }

          // Try again after a delay.
          console.log("waitForResource - waiting for %d msec", pollingInterval);
          return Promise.delay(pollingInterval)
            .then(() => {
              return this.waitForResource(datasetId, check, retryCount + 1, maxRetries);
            });
        } else {
          return dataset;
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
              console.log("waitForResource - ignoring error %s", err.message);
              return Promise.delay(pollingInterval)
                .then(() => {
                  return this.waitForResource(datasetId, check, retryCount + 1, maxRetries);
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
      console.log("builtIndexCheck: %s", dataset ? dataset.indexStatus : "no dataset");

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
