# nqm-api-tdx
nquiringminds Trusted Data Exchange command and query API interface for nodejs and browser clients

## install
```
npm install nqm-api-tdx@^0.2
```

## test
```
mocha test
```

## usage

### nodejs
```
const TDXApi = require("nqm-api-tdx");
```

### browser
```
import TDXApi from "nqm-api-tdx"
```

## API
## Classes

<dl>
<dt><a href="#TDXApi">TDXApi</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#CommandResult">CommandResult</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#DatasetData">DatasetData</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Resource">Resource</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Zone">Zone</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="TDXApi"></a>

## TDXApi
**Kind**: global class  

* [TDXApi](#TDXApi)
    * [new TDXApi(config)](#new_TDXApi_new)
    * [.authenticate(id, secret, [ttl])](#TDXApi+authenticate) ⇒ <code>string</code>
    * [.addAccount(options)](#TDXApi+addAccount) ⇒ [<code>CommandResult</code>](#CommandResult)
    * [.approveAccount(username, approved)](#TDXApi+approveAccount)
    * [.deleteAccount(username)](#TDXApi+deleteAccount)
    * [.resetAccount(username, key)](#TDXApi+resetAccount)
    * [.updateAccount(username, options)](#TDXApi+updateAccount)
    * [.verifyAccount(username, approved)](#TDXApi+verifyAccount)
    * [.addTrustedExchange(options)](#TDXApi+addTrustedExchange)
    * [.addResource(options, [wait])](#TDXApi+addResource)
    * [.addResourceAccess(resourceId, accountId, sourceId, access)](#TDXApi+addResourceAccess)
    * [.deleteResource(resourceId)](#TDXApi+deleteResource)
    * [.fileUpload(resourceId, file, [stream])](#TDXApi+fileUpload)
    * [.moveResource(id, fromParentId, toParentId)](#TDXApi+moveResource)
    * [.rebuildResourceIndex(resourceId)](#TDXApi+rebuildResourceIndex)
    * [.removeResourceAccess(resourceId, accountId, addedBy, sourceId, access)](#TDXApi+removeResourceAccess)
    * [.setResourceShareMode(resourceId, shareMode)](#TDXApi+setResourceShareMode)
    * [.setResourcePermissiveShare(resourceId, allowPermissive)](#TDXApi+setResourcePermissiveShare)
    * [.suspendResourceIndex(resourceId)](#TDXApi+suspendResourceIndex)
    * [.truncateResource(resourceId)](#TDXApi+truncateResource)
    * [.updateResource(resourceId, update)](#TDXApi+updateResource)
    * [.addData(datasetId, data)](#TDXApi+addData)
    * [.deleteData(datasetId, data)](#TDXApi+deleteData)
    * [.deleteDataByQuery(datasetId, query)](#TDXApi+deleteDataByQuery)
    * [.patchData(datasetId, data)](#TDXApi+patchData)
    * [.updateData(datasetId, data, [upsert])](#TDXApi+updateData)
    * [.deleteDatabotInstance(instanceId)](#TDXApi+deleteDatabotInstance)
    * [.sendDatabotHostCommand(command, hostId, [hostIp], [hostPort])](#TDXApi+sendDatabotHostCommand)
    * [.startDatabotInstance(databotId, payload)](#TDXApi+startDatabotInstance)
    * [.stopDatabotInstance(instanceId, mode)](#TDXApi+stopDatabotInstance)
    * [.getDatasetData(datasetId, [filter], [projection], [options])](#TDXApi+getDatasetData) ⇒ [<code>DatasetData</code>](#DatasetData)
    * [.getDatasetDataCount(datasetId, [filter])](#TDXApi+getDatasetDataCount)
    * [.getDistinct(datasetId, key, [filter])](#TDXApi+getDistinct) ⇒ <code>Array.&lt;object&gt;</code>
    * [.getResource(resourceId, [noThrow])](#TDXApi+getResource) ⇒ [<code>Resource</code>](#Resource)
    * [.getResourceAncestors(resourceId)](#TDXApi+getResourceAncestors) ⇒ [<code>Array.&lt;Resource&gt;</code>](#Resource)
    * [.getResources([filter], [projection], [options])](#TDXApi+getResources) ⇒ [<code>Array.&lt;Resource&gt;</code>](#Resource)
    * [.getResourcesWithSchema(schemaId)](#TDXApi+getResourcesWithSchema) ⇒ [<code>Array.&lt;Resource&gt;</code>](#Resource)
    * [.getTDXToken(tdx)](#TDXApi+getTDXToken) ⇒ <code>string</code>
    * [.getZone(accountId)](#TDXApi+getZone) ⇒ [<code>Zone</code>](#Zone)

<a name="new_TDXApi_new"></a>

### new TDXApi(config)
Create a TDXApi instance


| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | the TDX configuration for the remote TDX |
| [config.tdxHost] | <code>string</code> | the URL of the TDX auth server, e.g. https://tdx.nqminds.com. Usually this is the only host parameter needed, as long as the target TDX conforms to the standard service naming conventions e.g. https://[service].[tdx-domain].com. In this case the individual service hosts can be derived from the tdxHost name. Optionally, you can specify each individual service host (see below). Note you only need to provide the host for services you intend to use. For example, if you only need query services, just provide the query host. |
| [config.commandHost] | <code>string</code> | the URL of the TDX command service, e.g. https://cmd.nqminds.com |
| [config.queryHost] | <code>string</code> | the URL of the TDX query service, e.g. https://q.nqminds.com |
| [config.databotHost] | <code>string</code> | the URL of the TDX databot service, e.g. https://databot.nqminds.com |
| [config.accessToken] | <code>string</code> | an access token that will be used to authorise commands and queries. Alternatively you can use the authenticate method to acquire a token. |

**Example** *(standard usage)*  
```js
import TDXApi from "nqm-api-tdx";
const api = new TDXApi({tdxHost: "tdx.acme.com"});
```
<a name="TDXApi+authenticate"></a>

### tdxApi.authenticate(id, secret, [ttl]) ⇒ <code>string</code>
Authenticates with the TDX, acquiring an authorisation token.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Returns**: <code>string</code> - The access token.  
**Throws**:

- Will throw if credentials are invalid or there is a network error contacting the TDX.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | the account id, or a pre-formed credentials string, e.g. "DKJG8dfg:letmein" |
| secret | <code>string</code> |  | the account secret |
| [ttl] | <code>number</code> | <code>3600</code> | the Time-To-Live of the token in seconds, default is 1 hour. |

**Example** *(authenticate using a share key and secret)*  
```js
tdxApi.authenticate("DKJG8dfg", "letmein");
```
**Example** *(authenticate using custom ttl of 2 hours)*  
```js
tdxApi.authenticate("DKJG8dfg", "letmein", 7200);
```
<a name="TDXApi+addAccount"></a>

### tdxApi.addAccount(options) ⇒ [<code>CommandResult</code>](#CommandResult)
Adds an account to the TDX. An account can be an e-mail based user account, a share key (token) account,
a databot host, an application, or an account-set (user group).

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | new account options |
| options.accountType | <code>string</code> | the type of account, one of ["user", "token"] |
| [options.approved] | <code>bool</code> | account is pre-approved (reserved for system use only) |
| [options.authService] | <code>string</code> | the authentication type, one of ["local", "oauth:google", "oauth:github"]. Required for user-based accounts. Ignored for non-user accounts. |
| [options.displayName] | <code>string</code> | the human-friendly display name of the account, e.g. "Toby's share key" |
| [options.expires] | <code>number</code> | a timestamp at which the account expires and will no longer be granted a token |
| [options.key] | <code>string</code> | the account secret. Required for all but oauth-based account types. |
| [options.owner] | <code>string</code> | the owner of the account. |
| [options.scratchAccess] | <code>bool</code> | indicates this account can create resources in the owners scratch folder. Ignored for all accounts except share key (token) accounts. Is useful for databots that need to create intermediate or temporary resources without specifying a parent resource - if no parent resource is given when a resource is created and scratch access is enabled, the resource will be created in the owner's scratch folder. |
| [options.settings] | <code>object</code> | free-form JSON object for user data. |
| [options.username] | <code>string</code> | the username of the new account. Required for user-based accounts, and should be the account e-mail address. Can be omitted for non-user accounts, and will be auto-generated. |
| [options.verified] | <code>bool</code> | account is pre-verified (reserved for system use only) |
| [options.whitelist] | <code>Array.&lt;string&gt;</code> | a list of IP addresses. Tokens will only be granted if the requesting IP address is in this list |

<a name="TDXApi+approveAccount"></a>

### tdxApi.approveAccount(username, approved)
Set account approved status. Reserved for system use.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | the full TDX identity of the account. |
| approved | <code>bool</code> | account approved status |

<a name="TDXApi+deleteAccount"></a>

### tdxApi.deleteAccount(username)
Delete an account

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | the full TDX identity of the account to delete. |

<a name="TDXApi+resetAccount"></a>

### tdxApi.resetAccount(username, key)
Change account secret.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | the full TDX identity of the account. |
| key | <code>string</code> | the new secret |

<a name="TDXApi+updateAccount"></a>

### tdxApi.updateAccount(username, options)
Updates account details. All update properties are optional. See createAccount for full details of
each option.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | the full TDX identity of the account to update. |
| options | <code>object</code> | the update options |
| [options.displayName] | <code>string</code> |  |
| [options.key] | <code>string</code> |  |
| [options.scratchAccess] | <code>bool</code> |  |
| [options.settings] | <code>object</code> |  |
| [options.whitelist] | <code>Array.&lt;string&gt;</code> |  |

<a name="TDXApi+verifyAccount"></a>

### tdxApi.verifyAccount(username, approved)
Set account verified status. Reserved for system use.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | the full TDX identity of the account. |
| approved | <code>bool</code> | account verified status |

<a name="TDXApi+addTrustedExchange"></a>

### tdxApi.addTrustedExchange(options)
Adds a data exchange to the list of trusted exchanges known to the current TDX.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> |  |
| options.owner | <code>string</code> | the account on this TDX to which the trust relates, e.g. `bob@mail.com/tdx.acme.com` |
| options.targetServer | <code>string</code> | the TDX to be trusted, e.g. `tdx.nqminds.com` |
| options.targetOwner | <code>string</code> | the account on the target TDX that is trusted,  e.g. `alice@mail.com/tdx.nqminds.com`. |

<a name="TDXApi+addResource"></a>

### tdxApi.addResource(options, [wait])
Adds a resource to the TDX.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  | details of the resource to be added. |
| [options.basedOnSchema] | <code>string</code> | <code>&quot;dataset&quot;</code> | the id of the schema on which this resource will be based. |
| [options.derived] | <code>object</code> |  | definition of derived filter, implying this resource is a view on an existing dataset. |
| [options.derived.filter] | <code>object</code> |  | the (read) filter to apply, in mongodb query format, e.g. `{"temperature": {"$gt": 15}}` will mean that only data with a temperature value greater than 15 will be available in this view. The filter can be any arbitrarily complex mongodb query. Use the placeholder  `"@@_identity_@@"` to indicate that the identity of the currently authenticated user should be substituted. For example, if the user `bob@acme.com/tdx.acme.com` is currently authenticated, a filter of `{"username":  "@@_identity_@@"}` will resolve at runtime to `{"username": "bob@acme.com/tdx.acme.com"}`. |
| [options.derived.projection] | <code>object</code> |  | the (read) projection to apply, in mongodb projection format, e.g. `{"timestamp": 1, "temperature": 1}` implies only the 'timestamp' and 'temperature' properties will be returned. |
| [options.derived.source] | <code>string</code> |  | the id of the source dataset on which to apply the filters and projections. |
| [options.derived.writeFilter] | <code>object</code> |  | the write filter to apply, in mongodb query format. This controls what data can be written to the underlying source dataset. For example, a write filter of  `{"temperature": {"$lt": 40}}` means that attempts to write a temperature value greater than or equal to `40` will fail. The filter can be any arbitrarily complex mongodb query. |
| [options.derived.writeProjection] | <code>object</code> |  | the write projection to apply, in mongodb projection format. This controls what properties can be written to the underlying dataset. For example, a write projection of `{"temperature": 1}` means that only the temperature field can be written, and attempts to write data to other properties will fail. To allow a view to create new data in the underlying dataset, the primary key fields must be included in the write projection. |
| [options.description] | <code>string</code> |  | a description for the resource. |
| [options.id] | <code>string</code> |  | the requested ID of the new resource. Must be unique. Will be auto-generated if  omitted (recommended). |
| options.name | <code>string</code> |  | the name of the resource. Must be unique in the parent folder. |
| [options.meta] | <code>object</code> |  | a free-form object for storing metadata associated with this resource. |
| [options.parentId] | <code>string</code> |  | the id of the parent resource. If omitted, will default to the appropriate root folder based on the type of resource being created. |
| [options.provenance] | <code>string</code> |  | a description of the provenance of the resource. Markdown format is supported. |
| [options.schema] | <code>object</code> |  | optional schema definition. |
| [options.shareMode] | <code>string</code> |  | the share mode assigned to the new resource. One of [`"pw"`, `"pr"`, `"tr"`], corresponding to "public read/write", "public read/trusted write", "trusted only". |
| [options.tags] | <code>Array.&lt;string&gt;</code> |  | a list of tags to associate with the resource. |
| [wait] | <code>bool</code> | <code>false</code> | indicates if the call should wait for the index to be built before it returns. |

<a name="TDXApi+addResourceAccess"></a>

### tdxApi.addResourceAccess(resourceId, accountId, sourceId, access)
Adds read and/or write permission for an account to access a resource. Permission is required
equivalent to that which is being added, e.g. adding write permission requires existing
write access.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | The resource id |
| accountId | <code>string</code> | The account id to assign permission to |
| sourceId | <code>string</code> | The id of the resource acting as the source of the access. This is usually the same as the target `resourceId`, but can also be a parent resource. For example, if write access is granted with the sourceId set to be a parent, then if the permission is  revoked from the parent resource it will also be revoked from this resource. |
| access | <code>Array.&lt;string&gt;</code> | The access, one or more of [`"r"`, `"w"`]. Can be an array or an individual string. |

**Example** *(add access to an account)*  
```js
tdxApi.addResourceAccess(myResourceId, "bob@acme.com/tdx.acme.com", myResourceId, ["r"]);
```
<a name="TDXApi+deleteResource"></a>

### tdxApi.deleteResource(resourceId)
Permanently deletes a resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | the id of the resource to delete. Requires write permission to the resource. |

<a name="TDXApi+fileUpload"></a>

### tdxApi.fileUpload(resourceId, file, [stream])
Upload a file to a resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| resourceId | <code>string</code> |  | The id of the destination resource. |
| file | <code>object</code> |  | The file to upload, obtained from an `<input type="file">` element. |
| [stream] | <code>bool</code> | <code>false</code> | Flag indicating whether the call should return a stream allowing callees to monitor progress. |

<a name="TDXApi+moveResource"></a>

### tdxApi.moveResource(id, fromParentId, toParentId)
Move resource from one folder to another. Requires write permission on the resource, the
source parent and the target parent resources.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | the id of the resource to move. |
| fromParentId | <code>string</code> | the current parent resource to move from. |
| toParentId | <code>string</code> | the target folder resource to move to. |

<a name="TDXApi+rebuildResourceIndex"></a>

### tdxApi.rebuildResourceIndex(resourceId)
Resets the resource index. This involves deleting existing indexes and rebuilding them. May take
a while depending on the size of any associated dataset and the number and complexity of indexes.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | the id of the resource, requires write permission. |

<a name="TDXApi+removeResourceAccess"></a>

### tdxApi.removeResourceAccess(resourceId, accountId, addedBy, sourceId, access)
Removes access for an account to a resource. Permission is required
equivalent to that which is being added, e.g. adding write permission requires existing
write access.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | The resource id. |
| accountId | <code>string</code> | The account id to remove access from. |
| addedBy | <code>string</code> | The account id that originally added the access, probably your account id. |
| sourceId | <code>string</code> | The source of the access, usually the resource itself. |
| access | <code>Array.&lt;string&gt;</code> | The access, one or more of [`"r"`, `"w"`]. |

<a name="TDXApi+setResourceShareMode"></a>

### tdxApi.setResourceShareMode(resourceId, shareMode)
Set the share mode for a resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | The resource id. |
| shareMode | <code>string</code> | The share mode to set, one or [`"pw"`, `"pr"`, `"tr"`] corresponding to 'public read/write', 'public read, trusted write', 'trusted only'. |

<a name="TDXApi+setResourcePermissiveShare"></a>

### tdxApi.setResourcePermissiveShare(resourceId, allowPermissive)
Sets the permissive share mode of the resource. Permissive share allows anybody with acces to the resource
to share it with others. If a resource is not in permissive share mode, only the resource owner
can share it with others.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | The resource id. |
| allowPermissive | <code>bool</code> | The required permissive share mode. |

<a name="TDXApi+suspendResourceIndex"></a>

### tdxApi.suspendResourceIndex(resourceId)
Suspends the resource index. This involves deleting any existing indexes. Requires write permission. When
a resource index is in `suspended` status, it is not possible to run any queries or updates against
the resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | the id of the resource. Requires write permission. |

<a name="TDXApi+truncateResource"></a>

### tdxApi.truncateResource(resourceId)
Removes all data from the resource. Applicable to dataset-based resources only. This can not be
undone.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | The resource id to truncate. |

<a name="TDXApi+updateResource"></a>

### tdxApi.updateResource(resourceId, update)
Modify one or more of the meta data associated with the resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | id of the resource to update |
| update | <code>object</code> | object containing the properties to update. Can be one or more of those listed below. See the [addResource](#TDXApi+addResource) method for semantics and syntax of each property. |
| [update.derived] | <code>string</code> |  |
| [update.description] | <code>string</code> |  |
| [update.meta] | <code>string</code> |  |
| [update.name] | <code>string</code> |  |
| [update.provenance] | <code>string</code> |  |
| [update.schema] | <code>string</code> |  |
| [update.tags] | <code>string</code> |  |

<a name="TDXApi+addData"></a>

### tdxApi.addData(datasetId, data)
Add data to a dataset resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| datasetId | <code>string</code> | The id of the dataset-based resource to add data to. |
| data | <code>object</code> \| <code>array</code> | The data to add. Must conform to the schema defined by the resource metadata. Supports creating an individual document or many documents. |

**Example** *(create an individual document)*  
```js
// Assumes the dataset primary key is 'lsoa'
tdxApi.addData(myDatasetId, {lsoa: "E0000001", count: 398});
```
**Example** *(create multiple documents)*  
```js
tdxApi.addData(myDatasetId, [
 {lsoa: "E0000001", count: 398},
 {lsoa: "E0000002", count: 1775},
 {lsoa: "E0000005", count: 4533},
]);
```
<a name="TDXApi+deleteData"></a>

### tdxApi.deleteData(datasetId, data)
Deletes data from a dataset-based resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| datasetId | <code>string</code> | The id of the dataset-based resource to delete data from. |
| data | <code>object</code> \| <code>array</code> | The primary key data to delete. |

<a name="TDXApi+deleteDataByQuery"></a>

### tdxApi.deleteDataByQuery(datasetId, query)
Deletes data from a dataset-based resource using a query to specify the documents to be deleted.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| datasetId | <code>string</code> | The id of the dataset-based resource to delete data from. |
| query | <code>object</code> | The query that specifies the data to delete. All documents matching the query will be deleted. |

**Example**  
```js
// Delete all documents with English lsoa.
tdxApi.deleteDataByQuery(myDatasetId, {lsoa: {$regex: "E*"}});
```
<a name="TDXApi+patchData"></a>

### tdxApi.patchData(datasetId, data)
Patches data in a dataset resource. Uses the [JSON patch](https://tools.ietf.org/html/rfc6902) format,
which involves defining the primary key data followed by a flexible update specification.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| datasetId | <code>string</code> | The id of the dataset-based resource to update. |
| data | <code>object</code> | The patch definition. |
| data.__update | <code>object</code> \| <code>array</code> | An array of JSON patch specifications. |

**Example** *(patch a single value in a single document)*  
```js
tdxApi.patchData(myDatasetId, {lsoa: "E000001", __update: [{p: "count", m: "r", v: 948}]});
```
**Example** *(patch a more than one value in a single document)*  
```js
tdxApi.patchData(myDatasetId, {lsoa: "E000001", __update: [
  {p: "count", m: "r", v: 948}
  {p: "modified", m: "a", v: Date.now()}
]});
```
<a name="TDXApi+updateData"></a>

### tdxApi.updateData(datasetId, data, [upsert])
Updates data in a dataset resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| datasetId | <code>string</code> |  | The id of the dataset-based resource to update. |
| data | <code>object</code> \| <code>array</code> |  | The data to update. Must conform to the schema defined by the resource metadata. Supports updating individual or multiple documents. |
| [upsert] | <code>bool</code> | <code>false</code> | Indicates the data should be created if no document is found matching the primary key. |

**Example** *(update an existing document)*  
```js
tdxApi.updateData(myDatasetId, {lsoa: "E000001", count: 488});
```
**Example** *(upsert a document)*  
```js
// Will create a document if no data exists matching key 'lsoa': "E000004"
tdxApi.updateData(myDatasetId, {lsoa: "E000004", count: 288, true});
```
<a name="TDXApi+deleteDatabotInstance"></a>

### tdxApi.deleteDatabotInstance(instanceId)
Deletes a databot instance and all output/debug data associated with it.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| instanceId | <code>string</code> | The id of the instance to delete. |

<a name="TDXApi+sendDatabotHostCommand"></a>

### tdxApi.sendDatabotHostCommand(command, hostId, [hostIp], [hostPort])
Sends a command to a databot host. Reserved for system use.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | The command to send. Must be one of ["stopHost", "updateHost", "runInstance", "stopInstance", "clearInstance"] |
| hostId | <code>string</code> | The id of the host. |
| [hostIp] | <code>string</code> | The ip address of the host. If omitted, the command will be sent to all host ip addresses. |
| [hostPort] | <code>number</code> | The port number of the host. If omitted, the command will be sent to all host ports. |

<a name="TDXApi+startDatabotInstance"></a>

### tdxApi.startDatabotInstance(databotId, payload)
Starts a databot instance.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| databotId | <code>string</code> |  | The id of the databot definition to start. |
| payload | <code>object</code> |  | The instance input and parameters. |
| [payload.authTokenTTL] | <code>number</code> |  | The time-to-live to use when creating the auth token, in seconds. Will default to the TDX-configured default if not given (usually 1 hour). |
| [payload.chunks] | <code>number</code> | <code>1</code> | The number of processes to instantiate. Each will be given the same input data, with only the chunk number varying. |
| [payload.debugMode] | <code>bool</code> | <code>false</code> | Flag indicating this instance should be run in debug mode, meaning all debug output will be captured and stored on the TDX. n.b. setting this will also restrict the hosts available to run the instance to those that are willing to run in debug mode. |
| [payload.description] | <code>string</code> |  | The description for this instance. |
| [payload.inputs] | <code>object</code> |  | The input data. A free-form object that should conform to the specification in the associated databot definition. |
| [payload.name] | <code>string</code> |  | The name to associate with this instance, e.g. "Male population projection 2017" |
| [payload.overwriteExisting] | <code>string</code> |  | The id of an existing instance that should be overwritten. |
| [payload.priority] | <code>number</code> |  | The priority to assign this instance. Reserved for system use. |
| payload.shareKeyId | <code>string</code> |  | The share key to run the databot under. |
| [payload.shareKeySecret] | <code>string</code> |  | The secret of the share key. Ignored if the share key id refers to a user-based account. |

<a name="TDXApi+stopDatabotInstance"></a>

### tdxApi.stopDatabotInstance(instanceId, mode)
Terminates or pauses a running databot instance.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| instanceId | <code>string</code> | The id of the instance to terminate or pause. |
| mode | <code>string</code> | One of [`"stop"`, `"pause"`, `"resume"`] |

<a name="TDXApi+getDatasetData"></a>

### tdxApi.getDatasetData(datasetId, [filter], [projection], [options]) ⇒ [<code>DatasetData</code>](#DatasetData)
Gets all data from the given dataset that matches the filter provided.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| datasetId | <code>string</code> | The id of the dataset-based resource. |
| [filter] | <code>object</code> | A mongodb filter object. If omitted, all data will be retrieved. |
| [projection] | <code>object</code> | A mongodb projection object. Should be used to restrict the payload to the minimum properties needed if a lot of data is being retrieved. |
| [options] | <code>object</code> | A mongodb options object. Can be used to limit, skip, sort etc. Note a default `limit` of 1000 is applied if none is given here. |
| [options.nqmMeta] | <code>bool</code> | When set, the resource metadata will be returned along with the dataset data. Can be used to avoid a second call to `getResource`. Otherwise a URL to the metadata is provided. |

<a name="TDXApi+getDatasetDataCount"></a>

### tdxApi.getDatasetDataCount(datasetId, [filter])
Gets a count of the data in a dataset-based resource, after applying the given filter.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| datasetId | <code>string</code> | The id of the dataset-based resource. |
| [filter] | <code>object</code> | An optional mongodb filter to apply before counting the data. |

<a name="TDXApi+getDistinct"></a>

### tdxApi.getDistinct(datasetId, key, [filter]) ⇒ <code>Array.&lt;object&gt;</code>
Gets a list of distinct values for a given property in a dataset-based resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Returns**: <code>Array.&lt;object&gt;</code> - - The distinct values.  

| Param | Type | Description |
| --- | --- | --- |
| datasetId | <code>string</code> | The id of the dataset-based resource. |
| key | <code>string</code> | The name of the property to use. Can be a property path, e.g. `"address.postcode"`. |
| [filter] | <code>object</code> | An optional mongodb filter to apply. |

<a name="TDXApi+getResource"></a>

### tdxApi.getResource(resourceId, [noThrow]) ⇒ [<code>Resource</code>](#Resource)
Gets the details for a given resource id.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Throws**:

- Will throw if the resource is not found (see `noThrow` flag) or permission is denied.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| resourceId | <code>string</code> |  | The id of the resource to retrieve. |
| [noThrow] | <code>bool</code> | <code>false</code> | If set, the call won't reject or throw if the resource doesn't exist. |

<a name="TDXApi+getResourceAncestors"></a>

### tdxApi.getResourceAncestors(resourceId) ⇒ [<code>Array.&lt;Resource&gt;</code>](#Resource)
Gets all resources that are ancestors of the given resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | The id of the resource whose parents are to be retrieved. |

<a name="TDXApi+getResources"></a>

### tdxApi.getResources([filter], [projection], [options]) ⇒ [<code>Array.&lt;Resource&gt;</code>](#Resource)
Gets the details of all resources that match the given filter.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| [filter] | <code>object</code> | A mongodb filter definition |
| [projection] | <code>object</code> | A mongodb projection definition, can be used to restrict which properties are returned thereby limiting the payload. |
| [options] | <code>object</code> | A mongodb options definition, can be used for limit, skip, sorting etc. |

<a name="TDXApi+getResourcesWithSchema"></a>

### tdxApi.getResourcesWithSchema(schemaId) ⇒ [<code>Array.&lt;Resource&gt;</code>](#Resource)
Retrieves all resources that have an immediate ancestor of the given schema id.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| schemaId | <code>string</code> | The id of the schema to match, e.g. `"geojson"`. |

<a name="TDXApi+getTDXToken"></a>

### tdxApi.getTDXToken(tdx) ⇒ <code>string</code>
Retrieves an authorisation token for the given TDX instance

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| tdx | <code>string</code> | The TDX instance name, e.g. `"tdx.acme.com"`. |

<a name="TDXApi+getZone"></a>

### tdxApi.getZone(accountId) ⇒ [<code>Zone</code>](#Zone)
Gets the details for a given zone (account) id.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Returns**: [<code>Zone</code>](#Zone) - zone  

| Param | Type | Description |
| --- | --- | --- |
| accountId | <code>string</code> | the id of the zone to be retrieved. |

<a name="CommandResult"></a>

## CommandResult : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| commandId | <code>string</code> | The auto-generated unique id of the command. |
| response | <code>object</code> \| <code>string</code> | The result of the command. If a command is sent asynchronously, this will simply be the string `"ack"`. In synchronous mode, this will usually be an object consisting of the primary key of the data that was affected by the command. |

<a name="DatasetData"></a>

## DatasetData : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| metaData | <code>object</code> | The dataset metadata (see `nqmMeta` option in `getDatasetData`). |
| metaDataUrl | <code>string</code> | The URL to the dataset metadata (see `nqmMeta` option in `getDatasetData`. |
| data | <code>Array.&lt;object&gt;</code> | The dataset documents. |

<a name="Resource"></a>

## Resource : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| description | <code>string</code> | 
| id | <code>string</code> | 
| name | <code>string</code> | 
| parents | <code>Array.&lt;string&gt;</code> | 
| schemaDefinition | <code>object</code> | 
| tags | <code>Array.&lt;string&gt;</code> | 

<a name="Zone"></a>

## Zone : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| accountType | <code>string</code> | 
| displayName | <code>string</code> | 
| username | <code>string</code> | 

