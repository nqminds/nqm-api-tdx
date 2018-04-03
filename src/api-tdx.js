import base64 from "base-64";
import debug from "debug";
import nqmUtils from "@nqminds/nqm-core-utils";
import {
  buildCommandRequest,
  buildDatabotHostRequest,
  buildDatabotInstanceRequest,
  buildQueryRequest,
  checkResponse,
  fetchWithDeadline as fetch,
  handleError,
  setDefaults,
  waitForAccount,
  waitForIndex,
} from "./helpers";

const log = debug("nqm-api-tdx");
const errLog = debug("nqm-api-tdx:error");

/**
 * @typedef  {object} CommandResult
 * @property  {string} commandId - The auto-generated unique id of the command.
 * @property  {object|string} response - The response of the command. If a command is sent asynchronously, this will
 * simply be the string `"ack"`. In synchronous mode, this will usually be an object consisting of the primary key
 * of the data that was affected by the command.
 * @property  {object} result - Contains detailed error information when available.
 * @property  {array} result.errors - Will contain error information when appropriate.
 * @property  {array} result.commit - Contains details of each commited document.
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
   * @example <caption>standard usage</caption>
   * import TDXApi from "nqm-api-tdx";
   * const api = new TDXApi({tdxServer: "https://tdx.acme.com"});
   */
  constructor(config) {
    this.config = {...config};
    this.accessToken = config.accessToken || config.authToken || "";
    setDefaults(this.config);
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
    }

    // Authorization headers must be base-64 encoded.
    credentials = base64.encode(credentials);

    // We can get a token from any of the TDX services - use the first one we find to build a fetch Request.
    const uri = `${this.config.tdxServer || this.config.commandServer || this.config.queryServer}/token`;
    const request = new Request(uri, {
      method: "POST",
      mode: "cors",
      headers: new Headers({
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({grant_type: "client_credentials", ip, ttl: ttl || this.config.accessTokenTTL || 3600}),
    });

    return fetch.call(this, request)
      .then(checkResponse.bind(null, "authenticate"))
      .then((result) => {
        log(result);
        this.accessToken = result.access_token;
        return this.accessToken;
      })
      .catch((err) => {
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
   * @return  {CommandResult}
   */
  addAccount(options, wait) {
    const request = buildCommandRequest.call(this, "account/create", options);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.addAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "addAccount"))
      .then((result) => {
        if (wait) {
          return waitForAccount.call(this, options.username, options.verified, options.approved)
            .then(() => {
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
   * @param {bool} [wait=false] - whether or not to wait for the projection to catch up.
   */
  addAccountApplicationConnection(accountId, applicationId, wait) {
    const request = buildCommandRequest.call(this, "account/connectApplication", {accountId});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.addAccountApplicationConnection: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "addAccountApplicationConnection"))
      .then((result) => {
        if (wait) {
          const applicationUserId = nqmUtils.shortHash(`${applicationId}-${accountId}`);
          return waitForIndex.call(this, applicationUserId)
            .then(() => {
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
    const request = buildCommandRequest.call(this, "account/approve", {username, approved});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.approveAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "approveAccount"));
  }

  /**
   * Delete an account
   * @param  {string} username - the full TDX identity of the account to delete.
   */
  deleteAccount(username) {
    const request = buildCommandRequest.call(this, "account/delete", {username});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.deleteAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "deleteAccount"));
  }

  /**
   * Change account secret.
   * @param  {string} username - the full TDX identity of the account.
   * @param  {string} key - the new secret
   */
  resetAccount(username, key) {
    const request = buildCommandRequest.call(this, "account/reset", {username, key});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.resetAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "resetAccount"));
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
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.updateAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "addAccount"));
  }

  /**
   * Set account verified status. Reserved for system use.
   * @param  {string} username - the full TDX identity of the account.
   * @param  {bool} approved - account verified status
   */
  verifyAccount(username, verified) {
    const request = buildCommandRequest.call(this, "account/verify", {username, verified});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.verifyAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "verifyAccount"));
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
    return fetch.call(this, request)
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
   * @param  {string} [options.parentId] - the id of the parent resource. If omitted, will default to the appropriate
   * root folder based on the type of resource being created.
   * @param  {string} [options.provenance] - a description of the provenance of the resource. Markdown format is
   * supported.
   * @param  {object} [options.schema] - optional schema definition.
   * @param  {string} [options.shareMode] - the share mode assigned to the new resource. One of [`"pw"`, `"pr"`,
   * `"tr"`], corresponding to "public read/write", "public read/trusted write", "trusted only".
   * @param  {string[]} [options.tags] - a list of tags to associate with the resource.
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
  addResource(options, wait) {
    const request = buildCommandRequest.call(this, "resource/create", options);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.addResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "addResource"))
      .then((result) => {
        if (wait) {
          return waitForIndex.call(this, result.response.id)
            .then(() => {
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
    const request = buildCommandRequest.call(this, "resourceAccess/add", {
      rid: resourceId,
      aid: accountId,
      src: sourceId,
      acc: [].concat(access),
    });
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.addResourceAccess: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "addResourceAccess"));
  }

  /**
   * Permanently deletes a resource.
   * @param  {string} resourceId - the id of the resource to delete. Requires write permission
   * to the resource.
   */
  deleteResource(resourceId) {
    const request = buildCommandRequest.call(this, "resource/delete", {id: resourceId});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.deleteResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "deleteResource"));
  }

  /**
   * Permanently deletes a list of resources.
   * Will fail **all** deletes if any of the permission checks fail.
   * @param  {string[]} resourceIdList - This list of resource ids to delete.
   * @return  {CommandResult}
   */
  deleteManyResources(resourceIdList) {
    const request = buildCommandRequest.call(this, "resource/deleteMany", {payload: resourceIdList});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.deleteManyResources: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "deleteManyResources"));
  }

  /**
   * Upload a file to a resource.
   * @param  {string} resourceId - The id of the destination resource.
   * @param  {object} file - The file to upload, obtained from an `<input type="file">` element.
   * @param  {bool} [stream=false] - Flag indicating whether the call should return a stream allowing
   * callees to monitor progress.
   * @param  {compressed} [boolean=false] - Flag indicating the file should be decompressed after upload. ZIP format
   * only.
   * @param  {base64Encoded} [boolean=false] = Flag indicating the file should be decoded from base64 after upload.
   */
  fileUpload(resourceId, file, stream, compressed = false, base64Encoded = false) {
    let endPoint;
    if (compressed) {
      endPoint = "compressedUpload";
    } else if (base64Encoded) {
      endPoint = "base64Upload";
    } else {
      endPoint = "upload";
    }
    const request = new Request(`${this.config.commandServer}/commandSync/resource/${resourceId}/${endPoint}`, {
      method: "POST",
      mode: "cors",
      headers: new Headers({
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Disposition": `attachment; filename="${file.name}"`,
        "Content-Length": file.size,
      }),
      body: file,
    });

    const response = fetch.call(this, request)
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

  /**
   * Move resource from one folder to another. Requires write permission on the resource, the
   * source parent and the target parent resources.
   * @param  {string} id - the id of the resource to move.
   * @param  {string} fromParentId - the current parent resource to move from.
   * @param  {string} toParentId - the target folder resource to move to.
   */
  moveResource(id, fromParentId, toParentId) {
    const request = buildCommandRequest.call(this, "resource/move", {id, fromParentId, toParentId});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.moveResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "moveResource"));
  }

  /**
   * Resets the resource index. This involves deleting existing indexes and rebuilding them. May take
   * a while depending on the size of any associated dataset and the number and complexity of indexes.
   * @param  {string} resourceId - the id of the resource, requires write permission.
   */
  rebuildResourceIndex(resourceId) {
    const request = buildCommandRequest.call(this, "resource/index/rebuild", {id: resourceId});
    let result;
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.rebuildResourceIndex: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "rebuildIndex"))
      .then((res) => {
        result = res;
        return waitForIndex.call(this, result.response.id, "built");
      })
      .then(() => {
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
    const request = buildCommandRequest.call(this, "resourceAccess/delete", {
      rid: resourceId,
      aid: accountId,
      by: addedBy,
      src: sourceId,
      acc: access,
    });
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.removeResourceAccess: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "removeResourceAccess"));
  }

  /**
   * Set the resource schema.
   * @param  {string} resourceId - The id of the dataset-based resource.
   * @param  {object} schema - The new schema definition. TODO - document
   * @return  {CommandResult}
   */
  setResourceSchema(resourceId, schema) {
    const request = buildCommandRequest.call(this, "resource/schema/set", {id: resourceId, schema});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.setResourceSchema: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "setResourceSchema"));
  }

  /**
   * Set the share mode for a resource.
   * @param  {string} resourceId - The resource id.
   * @param  {string} shareMode - The share mode to set, one or [`"pw"`, `"pr"`, `"tr"`] corresponding to
   * 'public read/write', 'public read, trusted write', 'trusted only'.
   */
  setResourceShareMode(resourceId, shareMode) {
    const request = buildCommandRequest.call(this, "resource/setShareMode", {id: resourceId, shareMode});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.setResourceShareMode: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "setResourceShareMode"));
  }

  /**
   * Sets the permissive share mode of the resource. Permissive share allows anybody with acces to the resource
   * to share it with others. If a resource is not in permissive share mode, only the resource owner
   * can share it with others.
   * @param  {string} resourceId - The resource id.
   * @param  {bool} allowPermissive - The required permissive share mode.
   */
  setResourcePermissiveShare(resourceId, allowPermissive) {
    const request = buildCommandRequest.call(this, "resource/setPermissiveShare", {
      id: resourceId,
      permissiveShare: allowPermissive ? "r" : "",
    });
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.setResourcePermissiveShare: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "setResourcePermissiveShare"));
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
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.suspendResourceIndex: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "suspendIndex"))
      .then((res) => {
        result = res;
        return waitForIndex.call(this, result.response.id, "suspended");
      })
      .then(() => {
        return result;
      });
  }

  /**
   * Removes all data from the resource. Applicable to dataset-based resources only. This can not be
   * undone.
   * @param  {string} resourceId - The resource id to truncate.
   */
  truncateResource(resourceId) {
    const request = buildCommandRequest.call(this, "resource/truncate", {id: resourceId});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.truncateResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "truncateResource"));
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
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.updateResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "updateResource"));
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
  addData(datasetId, data) {
    const postData = {
      datasetId,
      payload: [].concat(data),
    };
    const request = buildCommandRequest.call(this, "dataset/data/createMany", postData);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.addData: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "addData"));
  }

  /**
   * Deletes data from a dataset-based resource.
   * @param  {string} datasetId - The id of the dataset-based resource to delete data from.
   * @param  {object|array} data - The primary key data to delete.
   */
  deleteData(datasetId, data) {
    const postData = {
      datasetId,
      payload: [].concat(data),
    };
    const request = buildCommandRequest.call(this, "dataset/data/deleteMany", postData);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.deleteData: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "deleteData"));
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
  deleteDataByQuery(datasetId, query) {
    const postData = {
      datasetId,
      query: JSON.stringify(query),
    };
    const request = buildCommandRequest.call(this, "dataset/data/deleteQuery", postData);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.deleteDataByQuery: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "deleteDataByQuery"));
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
  patchData(datasetId, data) {
    const postData = {
      datasetId,
      payload: [].concat(data),
    };
    const request = buildCommandRequest.call(this, "dataset/data/upsertMany", postData);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.patchData: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "patchData"));
  }

  /**
   * Updates data in a dataset resource.
   * @param  {string} datasetId - The id of the dataset-based resource to update.
   * @param  {object|array} data - The data to update. Must conform to the schema defined by the resource metadata.
   * Supports updating individual or multiple documents.
   * @param  {bool} [upsert=false] - Indicates the data should be created if no document is found matching the
   * primary key.
   * @return {CommandResult} - Use the result property to check for errors.
   * @example <caption>update an existing document</caption>
   * tdxApi.updateData(myDatasetId, {lsoa: "E000001", count: 488});
   * @example <caption>upsert a document</caption>
   * // Will create a document if no data exists matching key 'lsoa': "E000004"
   * tdxApi.updateData(myDatasetId, {lsoa: "E000004", count: 288, true});
   */
  updateData(datasetId, data, upsert) {
    const postData = {
      datasetId,
      payload: [].concat(data),
      __upsert: !!upsert,
    };
    const request = buildCommandRequest.call(this, "dataset/data/updateMany", postData);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.updateData: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "updateData"));
  }

  /**
   * Updates data in a dataset-based resource using a query to specify the documents to be updated.
   * @param  {string} datasetId - The id of the dataset-based resource to update data in.
   * @param  {object} query - The query that specifies the data to update. All documents matching the
   * query will be updated.
   * @example
   * // Update all documents with English lsoa, setting `count` to 1000.
   * tdxApi.updateDataByQuery(myDatasetId, {lsoa: {$regex: "E*"}}, {count: 1000});
   */
  updateDataByQuery(datasetId, query, update) {
    const postData = {
      datasetId,
      query: JSON.stringify(query),
      update,
    };
    const request = buildCommandRequest.call(this, "dataset/data/updateQuery", postData);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.updateDataByQuery: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "updateDataByQuery"));
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
      payload,
    };
    const request = buildCommandRequest.call(this, "databot/host/delete", postData);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.deleteDatabotHost: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "deleteDatabotHost"));
  }

  /**
   * Deletes a databot instance and all output/debug data associated with it.
   * @param  {string[]} instanceId - The id(s) of the instances to delete. Can be an array of instance ids or an
   * individual string id
   */
  deleteDatabotInstance(instanceId) {
    const postData = {
      instanceId: [].concat(instanceId),
    };
    const request = buildCommandRequest.call(this, "databot/deleteInstance", postData);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.deleteDatabotInstance: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "deleteDatabotInstance"));
  }

  /**
   * Gets databot instance data for the given instance id.
   * @param  {string} instanceId - The id of the instance to retrieve.
   */
  getDatabotInstance(instanceId) {
    const request = buildDatabotInstanceRequest.call(this, instanceId);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.getDatabotInstance: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getDatabotInstance"));
  }

  /**
   * Get databot instance output.
   * @param  {string} instanceId - The instance id to retrieve output for.
   * @param  {string} [processId] - Optional process id. If omitted, output for all instance processes will be returned.
   */
  getDatabotInstanceOutput(instanceId, processId) {
    const request = buildDatabotInstanceRequest.call(this, `output/${instanceId}/${processId || ""}`);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.getDatabotInstanceOutput: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getDatabotInstanceOutput"));
  }

  /**
   * Get databot instance status.
   * @param  {string} instanceId - The id of the databot instance for which status is retrieved.
   */
  getDatabotInstanceStatus(instanceId) {
    const request = buildDatabotInstanceRequest.call(this, `status/${instanceId}`);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.getDatabotInstanceStatus: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getDatabotInstanceStatus"));
  }

  /**
   * Registers a databot host as active with the TDX.
   * @param  {object} status - The databot host identifier payload.
   */
  registerDatabotHost(status) {
    const request = buildDatabotHostRequest.call(this, "register", status);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.registerDatabotHost: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "registerDatabotHost"));
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
  sendDatabotHostCommand(command, hostId, hostIp, hostPort) {
    const postData = {
      hostId,
      hostIp,
      hostPort,
      command,
    };
    const request = buildCommandRequest.call(this, "databot/host/command", postData);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.sendDatabotHostCommand: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "sendDatabotHostCommand"));
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
      instanceData: payload,
    };
    const request = buildCommandRequest.call(this, "databot/startInstance", postData);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.startDatabotInstance: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "startDatabotInstance"));
  }

  /**
   * Terminates or pauses a running databot instance.
   * @param  {string} instanceId - The id of the instance to terminate or pause.
   * @param  {string} mode - One of [`"stop"`, `"pause"`, `"resume"`]
   */
  stopDatabotInstance(instanceId, mode) {
    const postData = {
      instanceId,
      mode,
    };
    const request = buildCommandRequest.call(this, "databot/stopInstance", postData);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.stopDatabotInstance: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "stopDatabotInstance"));
  }

  /**
   * Updates a databot host status.
   * @param  {object} status - The databot host status payload.
   */
  updateDatabotHostStatus(status) {
    const request = buildDatabotHostRequest.call(this, "status", status);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.updateDatabotHostStatus: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "updateDatabotHostStatus"));
  }

  /**
   * Stores databot instance output on the TDX.
   * @param  {object} output - The output payload for the databot instance.
   */
  writeDatabotHostInstanceOutput(output) {
    const request = buildDatabotHostRequest.call(this, "output", output);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.writeDatabotHostInstanceOutput: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "writeDatabotHostInstanceOutput"));
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
    const request = buildCommandRequest.call(this, "zoneConnection/create", options);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.addZoneConnection: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "addZoneConnection"));
  }

  /**
   * Deletes a zone connection. The authenticated account must own the zone connection.
   * @param  {string} id - The id of the zone connection to delete.
   */
  deleteZoneConnection(id) {
    const request = buildCommandRequest.call(this, "zoneConnection/delete", {id});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.deleteZoneConnection: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "deleteZoneConnection"));
  }

  /**
   * AUDIT COMMANDS
   */

  rollbackCommand(id) {
    const request = buildCommandRequest.call(this, "rollback", {id});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.rollbackCommand: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "rollbackCommand"));
  }

  /*
   *
   *  QUERIES
   *
   */

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
    const request = buildQueryRequest.call(this, "token/exchange", {token, ip: validateIP, exchangeIP, ttl});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.exchangeTDXToken: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "exchangeTDXToken"));
  }

  /**
   * Streams the contents of a resource. For dataset-based resources this will stream the dataset contents in newline
   * delimited JSON (NDJSON). For raw file resources this will stream the raw file contents (zip, raw JSON etc).
   * @param  {string} resourceId - The id of the resource to be downloaded.
   * @return {object} - Response object, where the response body is a stream object.
   */
  downloadResource(resourceId) {
    const request = buildQueryRequest.call(this, `resource/${resourceId}`);
    return fetch.call(this, request)
      .catch((err) => {
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
    const request = buildQueryRequest.call(this, "zones", {username: accountId});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.getZone: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getZone"))
      .then((zoneList) => {
        return zoneList && zoneList.length ? zoneList[0] : null;
      });
  }

   /**
   * Performs an aggregate query on the given dataset, returning a response object with stream in the body
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
    const endpoint = `datasets/${datasetId}/${ndJSON ? "ndaggregate" : "aggregate"}?pipeline=${pipeline}`;
    const request = buildQueryRequest.call(this, endpoint);
    return fetch.call(this, request)
    .catch((err) => {
      errLog("TDXApi.getAggregateData: %s", err.message);
      return Promise.reject(new Error(`${err.message} - [network error]`));
    });
  }

  /**
   * Performs an aggregate query on the given dataset.
   * @param  {string} datasetId - The id of the dataset-based resource to perform the aggregate query on.
   * @param  {object|string} pipeline - The aggregate pipeline, as defined in the
   * [mongodb docs](https://docs.mongodb.com/manual/aggregation/). Can be given as a JSON object or as a stringified
   * JSON object.
   * @param  {bool} [ndJSON] - If set, the data is sent in [newline delimited json format](http://ndjson.org/).
   * @return  {DatasetData}
   */
  getAggregateData(datasetId, pipeline, ndJSON) {
    return this.getAggregateDataStream(datasetId, pipeline, ndJSON)
      .then(checkResponse.bind(null, "getAggregateData"));
  }

  /**
   * Gets details of the currently authenticated account.
   * @return  {object} - Details of the authenticated account.
   */
  getAuthenticatedAccount() {
    const request = buildQueryRequest.call(this, "auth-account");
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.getAuthenticatedAccount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getAuthenticatedAccount"));
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
   * @param  {bool} [ndJSON] - If set, the data is sent in [newline delimited json format](http://ndjson.org/).
   * @return  {object} - Response object, where the response body is a stream object.
   */
  getDataStream(datasetId, filter, projection, options, ndJSON) {
    const endpoint = `datasets/${datasetId}/${ndJSON ? "nddata" : "data"}`;
    const request = buildQueryRequest.call(this, endpoint, filter, projection, options);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.getDataStream: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
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
   * @param  {bool} [ndJSON] - If set, the data is sent in [newline delimited json format](http://ndjson.org/).
   * @return  {DatasetData}
   */
  getData(datasetId, filter, projection, options, ndJSON) {
    return this.getDataStream(datasetId, filter, projection, options, ndJSON)
      .then(checkResponse.bind(null, "getData"));
  }

  /**
   * [DEPRECATED] - use getDataStream
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
   * @param  {bool} [ndJSON] - If set, the data is sent in [newline delimited json format](http://ndjson.org/).
   * @return  {object} - Response object, where the response body is a stream object.
   */
  getDatasetDataStream(datasetId, filter, projection, options, ndJSON) {
    return this.getDataStream(datasetId, filter, projection, options, ndJSON);
  }

  /**
   * [DEPRECATED] - use getData
   * Gets all data from the given dataset that matches the filter provided.
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
  getDatasetDataCount(datasetId, filter) {
    const request = buildQueryRequest.call(this, `datasets/${datasetId}/count`, filter);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.getDatasetDataCount: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getDatasetDataCount"));
  }

  /**
   * Gets a list of distinct values for a given property in a dataset-based resource.
   * @param  {string} datasetId - The id of the dataset-based resource.
   * @param  {string} key - The name of the property to use. Can be a property path, e.g. `"address.postcode"`.
   * @param  {object} [filter] - An optional mongodb filter to apply.
   * @return  {object[]} - The distinct values.
   */
  getDistinct(datasetId, key, filter, projection, options) {
    const request = buildQueryRequest.call(this, `datasets/${datasetId}/distinct?key=${key}`, filter, projection, options); // eslint-disable-line max-len
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.getDistinct: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getDistinct"));
  }

  /**
   * Gets the details for a given resource id.
   * @param  {string} resourceId - The id of the resource to retrieve.
   * @param  {bool} [noThrow=false] - If set, the call won't reject or throw if the resource doesn't exist.
   * @return  {Resource}
   * @exception  Will throw if the resource is not found (see `noThrow` flag) or permission is denied.
   */
  getResource(resourceId, noThrow) {
    const request = buildQueryRequest.call(this, `resources/${resourceId}`);
    return fetch.call(this, request)
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

  /**
   * Gets all access the authenticated account has to the given resource id.
   * @param  {string} resourceId - The id of the resource whose access is to be retrieved.
   * @return {object[]} - Array of access objects.
   */
  getResourceAccess(resourceId, filter, projection, options) {
    const request = buildQueryRequest.call(this, `resources/${resourceId}/access`, filter, projection, options);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.getResourceAccess: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then((response) => {
        return checkResponse("getResourceAccess", response);
      });
  }

  /**
   * Gets all resources that are ancestors of the given resource.
   * @param  {string} resourceId - The id of the resource whose parents are to be retrieved.
   * @return  {Resource[]}
   */
  getResourceAncestors(resourceId) {
    const request = buildQueryRequest.call(this, `datasets/${resourceId}/ancestors`);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.getDatasetAncestors: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getResourceAncestors"));
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
    const request = buildQueryRequest.call(this, "resources", filter, projection, options);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.getResource: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getResources"));
  }

  /**
   * Retrieves all resources that have an immediate ancestor of the given schema id.
   * @param  {string} schemaId - The id of the schema to match, e.g. `"geojson"`.
   * @return  {Resource[]}
   */
  getResourcesWithSchema(schemaId) {
    const filter = {"schemaDefinition.parent": schemaId};
    return this.getResources(filter);
  }

  /**
   * Retrieves an authorisation token for the given TDX instance
   * @param  {string} tdx - The TDX instance name, e.g. `"tdx.acme.com"`.
   * @return  {string}
   */
  getTDXToken(tdx) {
    const request = buildQueryRequest.call(this, `tdx-token/${tdx}`);
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.getTDXToken: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "getTDXToken"));
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
      "r.0": {$exists: true},
      grp: "m",
    };
    return this.getResourceAccess(groupId, lookup)
      .then((access) => {
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
    const request = buildQueryRequest.call(this, "token/validate", {token, ip});
    return fetch.call(this, request)
      .catch((err) => {
        errLog("TDXApi.validateTDXToken: %s", err.message);
        return Promise.reject(new Error(`${err.message} - [network error]`));
      })
      .then(checkResponse.bind(null, "validateTDXToken"));
  }
}

export default TDXApi;
