import fetch from "isomorphic-fetch";
import base64 from "base-64";
import debug from "debug";
import {buildCommandRequest, buildQueryRequest, checkResponse, handleError, setDefaults} from "./helpers";

const log = debug("nqm-api-tdx");
const errLog = debug("nqm-api-tdx:error");

const pollingRetries = 15;
const pollingInterval = 1000;
const waitInfinitely = -1;

class TDXApi {
  /**
   * Create a TDXApi instance
   * @param  {object} config - the TDX configuration for the remote TDX
   * @param  {string} [config.tdxHost] - the URL of the TDX auth server, e.g. https://tdx.nqminds.com. Usually this
   * is the only host parameter needed, as long as the target TDX conforms to the standard service naming conventions
   * e.g. https://[service].[tdx-domain].com. In this case the individual service hosts can be derived from the tdxHost
   * name. Optionally, you can specify each individual service host (see below). Note you only need to provide the host
   * for services you intend to use. For example, if you only need query services, just provide the query host.
   * @param  {string} [config.commandHost] - the URL of the TDX command service, e.g. https://cmd.nqminds.com 
   * @param  {string} [config.queryHost] - the URL of the TDX query service, e.g. https://q.nqminds.com
   * @param  {string} [config.databotHost] - the URL of the TDX databot service, e.g. https://databot.nqminds.com
   * @param  {string} [config.accessToken] - an access token that will be used to authorise commands and queries.
   * Alternatively you can use the authenticate method to acquire a token.
   */
  constructor(config) {
    this.config = config;
    this.accessToken = config.accessToken || "";
    setDefaults(this.config);
  }
  
  /**
   * Authenticates with the TDX, acquiring an authorisation token.
   * @param  {string} id - the account id, or a pre-formed credentials string, e.g. "DKJG8dfg:letmein"
   * @param  {string} secret - the account secret
   * @param  {number} [ttl=3600] - the Time-To-Live of the token in seconds, default is 1 hour.
   */
  authenticate(id, secret, ttl) {
    let credentials;

    if (typeof secret !== "string") {
      // Assume the first argument is a pre-formed credentials string
      credentials = id;
      ttl = secret;
    } else {
      // uri-encode the username and concatenate with secret.
      credentials = `${encodeURIComponent(id)}:${secret}`;
    }

    // Authorization headers must be base-64 encoded.
    credentials = base64.encode(credentials);

    // We can get a token from any of the TDX services - use the first one we find to build a fetch Request.
    const uri = `${this.config.tdxHost || this.config.commandHost || this.config.queryHost}/token`;
    const request = new Request(uri, {
      method: "POST",
      mode: "cors",
      headers: new Headers({
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({grant_type: "client_credentials", ttl: ttl || this.config.accessTokenTTL || 3600}),
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
   */
  addAccount(options) {
    const request = buildCommandRequest.call(this, "account/create", options);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.addAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "addAccount"));
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
    const request = buildCommandRequest.call(this, "account/update", {username, ...options});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.updateAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "addAccount"));
  }

  /**
   * Set account approved status. Reserved for system use.
   * @param  {string} username - the full TDX identity of the account.
   * @param  {bool} approved - account approved status
   */
  approveAccount(username, approved) {
    const request = buildCommandRequest.call(this, "account/approve", {username, approved});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.approveAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "approveAccount"));
  }

  /**
   * Change account secret.
   * @param  {string} username - the full TDX identity of the account.
   * @param  {string} key - the new secret
   */
  resetAccount(username, key) {
    const request = buildCommandRequest.call(this, "account/reset", {username, key});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.resetAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "resetAccount"));
  }

  /**
   * Set account verified status. Reserved for system use.
   * @param  {string} username - the full TDX identity of the account.
   * @param  {bool} approved - account verified status
   */
  verifyAccount(username, verified) {
    const request = buildCommandRequest.call(this, "account/verify", {username, verified});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.verifyAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "verifyAccount"));
  }

  /**
   * Delete an account
   * @param  {string} username - the full TDX identity of the account to delete.
   */
  deleteAccount(username) {
    const request = buildCommandRequest.call(this, "account/delete", {username});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.deleteAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "deleteAccount"));
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
    const request = buildCommandRequest.call(this, "trustedConnection/create", options);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.addTrustedExchange: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "addTrustedExchange"));
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
   * @param  {string} [options.parentId] - the id of the parent resource. If omitted, will default to the appropriate root
   * folder based on the type of resource being created.
   * @param  {string} [options.provenance] - a description of the provenance of the resource. Markdown format is supported.
   * @param  {object} [options.schema] - optional schema definition.
   * @param  {string} [options.shareMode] - the share mode assigned to the new resource. One of [`"pw"`, `"pr"`,
   * `"tr"`], corresponding to "public read/write", "public read/trusted write", "trusted only".
   * @param  {string[]} [options.tags] - a list of tags to associate with the resource.
   * @param  {bool} [wait=false] - indicates if the call should wait for the index to be built before it returns.
   */
  addResource(options, wait) {
    const request = buildCommandRequest.call(this, "resource/create", options);
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
  updateResource(resourceId, update) {
    const request = buildCommandRequest.call(this, "resource/update", {id: resourceId, ...update});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.updateResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "updateResource"));
  }

  /**
   * Move resource from one folder to another. Requires write permission on the resource, the
   * source parent and the target parent resources.
   * @param  {string} id - the id of the resource to move.
   * @param  {string} fromParentId - the current parent resource to move from.
   * @param  {string} toParentId - the target folder resource to move to.
   */
  moveResource(id, fromParentId, toParentId) {
    const request = buildCommandRequest.call(this, "resource/move", {id, fromParentId, toParentId});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.moveResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "moveResource"));
  }

  /**
   * Permanently deletes a resource.
   * @param  {string} resourceId - the id of the resource to delete. Requires write permission
   * to the resource.
   */
  deleteResource(resourceId) {
    const request = buildCommandRequest.call(this, "resource/delete", {id: resourceId});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.deleteResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "deleteResource"));
  }

  /**
   * Resets the resource index. This involves deleting existing indexes and rebuilding them. May take
   * a while depending on the size of any associated dataset and the number and complexity of indexes.
   * @param  {string} resourceId - the id of the resource, requires write permission.
   */
  rebuildResourceIndex(resourceId) {
    const request = buildCommandRequest.call(this, "resource/index/rebuild", {id: resourceId});
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

  /**
   * Suspends the resource index. This involves deleting any existing indexes. Requires write permission. When
   * a resource index is in `suspended` status, it is not possible to run any queries or updates against
   * the resource.
   * @param  {string} resourceId - the id of the resource. Requires write permission.
   */
  suspendResourceIndex(resourceId) {
    const request = buildCommandRequest.call(this, "resource/index/suspend", {id: resourceId});
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

  /**
   * Adds read and/or write permission for an account to access a resource.
   * @param  {string} resourceId - the resource id
   * @param  {string} accountId - the account id to assign permission to
   * @param  {string} sourceId - the id of the resource acting as the source of the access. This
   * is usually the same as the target resourceId, but can also be a parent resource. For example,
   * if write access is granted with the sourceId set to be a parent, then if the permission is 
   * revoked from the parent resource it will also be revoked from this resource.
   * @param  {string[]} access - the access, one of [`"r"`, `"w"`]
   */
  addResourceAccess(resourceId, accountId, sourceId, access) {
    const request = buildCommandRequest.call(this, "resourceAccess/add", {
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
    const request = buildCommandRequest.call(this, "resourceAccess/delete", {
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
    const request = buildCommandRequest.call(this, "resource/setShareMode", {id: resourceId, shareMode});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.setResourceShareMode: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "setResourceShareMode"));
  }

  setResourcePermissiveShare(resourceId, allowPermissive) {
    const request = buildCommandRequest.call(this, "resource/setPermissiveShare", {
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
    const request = buildCommandRequest.call(this, "resource/truncate", {id: resourceId});
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.truncateResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "truncateResource"));
  }

  /*
   *
   *  RESOURCE DATA COMMANDS
   *
   */

  addData(datasetId, data) {
    const postData = {
      datasetId,
      payload: [].concat(data),
    };
    const request = buildCommandRequest.call(this, "dataset/data/createMany", postData);
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
    const request = buildCommandRequest.call(this, "dataset/data/updateMany", postData);
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
    const request = buildCommandRequest.call(this, "dataset/data/upsertMany", postData);
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
      payload: [].concat(data),
    };
    const request = buildCommandRequest.call(this, "dataset/data/deleteMany", postData);
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
    const request = buildCommandRequest.call(this, "dataset/data/deleteQuery", postData);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.deleteDataByQuery: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "deleteDataByQuery"));
  }

  fileUpload(resourceId, file, stream) {
    const request = new Request(`${this.config.commandHost}/commandSync/resource/${resourceId}/upload`, {
      method: "POST",
      mode: "cors",
      headers: new Headers({
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Disposition": `attachment; filename="${file.name}"`,
        "Content-Length": file.size,
      }),
      body: file,
    });

    const response = fetch(request)
      .catch((err) => {
        errLog("TDXApi.fileUpload: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      });

    if (stream) {
      return response;
    } else {
      return response
      .then((response) => {
        return [response, response.text()];
      })
      .spread((response, text) => {
        if (response.ok) {
          return Promise.resolve(text);
        } else {
          return Promise.reject(handleError("fileUpload", {code: "failure", message: text}));
        }
      });
    }
  }

  /*
   *
   *  DATABOT COMMANDS
   *
   */

  startDatabotInstance(databotId, payload) {
    const postData = {
      databotId,
      instanceData: payload,
    };
    const request = buildCommandRequest.call(this, "databot/startInstance", postData);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.startDatabotInstance: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "startDatabotInstance"));
  }

  stopDatabotInstance(instanceId, mode) {
    const postData = {
      instanceId,
      mode,
    };
    const request = buildCommandRequest.call(this, "databot/stopInstance", postData);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.stopDatabotInstance: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "stopDatabotInstance"));
  }

  deleteDatabotInstance(instanceId) {
    const postData = {
      instanceId,
    };
    const request = buildCommandRequest.call(this, "databot/deleteInstance", postData);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.deleteDatabotInstance: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "deleteDatabotInstance"));
  }

  sendDatabotHostCommand(command, hostId, hostIp, hostPort) {
    const postData = {
      hostId,
      hostIp,
      hostPort,
      command,
    };
    const request = buildCommandRequest.call(this, "databot/host/command", postData);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.sendDatabotHostCommand: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "sendDatabotHostCommand"));
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

  getResource(resourceId, noThrow) {
    const request = this.buildQueryRequest(`resources/${resourceId}`);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.getResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then((response) => {
        if (noThrow) {
          // If noThrow specified, return null if there is an error fetching the resource, rather than throwing.
          if (response.ok) {
            return response.json();
          } else if (response.status === 404) {
            return null;
          } else {
            return checkResponse("getResource", response);
          }
        } else {
          return checkResponse("getResource", response);
        }
      });
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

  getTDXToken(tdx) {
    const request = this.buildQueryRequest(`tdx-token/${tdx}`);
    return fetch(request)
      .catch((err) => {
        errLog("TDXApi.getTDXToken: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getTDXToken"));
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
          return new Promise((resolve) => {
            setTimeout(() => {
              log("waitForResource - trying again");
              resolve(this.waitForResource(resourceId, check, retryCount + 1, maxRetries));
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
              log("waitForResource - ignoring error %s", err.message);
              return new Promise((resolve) => {
                setTimeout(() => {
                  resolve(this.waitForResource(resourceId, check, retryCount + 1, maxRetries));
                }, pollingInterval);
              });
            } else {
              // All other errors are fatal.
              return Promise.reject(err);
            }
          } catch (parseEx) {
            // Failed to parse TDX error - re-throw the original error.
            log("waitForResource failure: [%s]", parseEx.message);
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
