## Classes

<dl>
<dt><a href="#TDXApi">TDXApi</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#TDXApiError">TDXApiError</a> : <code>Error</code></dt>
<dd><p>The TDX api supplies detailed error information depending on the context of the call.
In some instances, e.g. attempting to retrieve a resource that does not exist, the
error will be a simple <code>NotFound</code> string message. In other cases, e.g. attempting
to update 100 documents in a single call, the error will supply details for each
document update that failed, such as the primary key of the document and the reason
for the failure.</p>
</dd>
<dt><a href="#CommandResult">CommandResult</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#DatasetData">DatasetData</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Resource">Resource</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#ResourceAccess">ResourceAccess</a> : <code>object</code></dt>
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
    * [.addAccount(options, [wait])](#TDXApi+addAccount) ⇒ [<code>CommandResult</code>](#CommandResult)
    * [.addAccountApplicationConnection(accountId, applicationId, [wait])](#TDXApi+addAccountApplicationConnection)
    * [.approveAccount(username, approved)](#TDXApi+approveAccount)
    * [.deleteAccount(username)](#TDXApi+deleteAccount)
    * [.resetAccount(username, key)](#TDXApi+resetAccount)
    * [.updateAccount(username, options)](#TDXApi+updateAccount)
    * [.verifyAccount(username, approved)](#TDXApi+verifyAccount)
    * [.addTrustedExchange(options)](#TDXApi+addTrustedExchange)
    * [.addResource(options, [wait])](#TDXApi+addResource)
    * [.addResourceAccess(resourceId, accountId, sourceId, access)](#TDXApi+addResourceAccess)
    * [.deleteResource(resourceId)](#TDXApi+deleteResource)
    * [.deleteManyResources(resourceList)](#TDXApi+deleteManyResources) ⇒ [<code>CommandResult</code>](#CommandResult)
    * [.fileUpload(resourceId, file, [stream], [compressed], [base64Encoded])](#TDXApi+fileUpload)
    * [.moveResource(id, fromParentId, toParentId)](#TDXApi+moveResource)
    * [.rebuildResourceIndex(resourceId)](#TDXApi+rebuildResourceIndex)
    * [.removeResourceAccess(resourceId, accountId, addedBy, sourceId, access)](#TDXApi+removeResourceAccess)
    * [.setResourceImporting(resourceId, importing)](#TDXApi+setResourceImporting) ⇒ [<code>CommandResult</code>](#CommandResult)
    * [.setResourceSchema(resourceId, schema)](#TDXApi+setResourceSchema) ⇒ [<code>CommandResult</code>](#CommandResult)
    * [.setResourceShareMode(resourceId, shareMode)](#TDXApi+setResourceShareMode)
    * [.setResourcePermissiveShare(resourceId, allowPermissive)](#TDXApi+setResourcePermissiveShare)
    * [.setResourceTextContent(resourceId, textContent)](#TDXApi+setResourceTextContent)
    * [.suspendResourceIndex(resourceId)](#TDXApi+suspendResourceIndex)
    * [.truncateResource(resourceId)](#TDXApi+truncateResource)
    * [.updateResource(resourceId, update)](#TDXApi+updateResource)
    * [.addData(datasetId, data, [doNotThrow])](#TDXApi+addData)
    * [.deleteData(datasetId, data, [doNotThrow])](#TDXApi+deleteData)
    * [.deleteDataByQuery(datasetId, query, [doNotThrow])](#TDXApi+deleteDataByQuery)
    * [.patchData(datasetId, data, [doNotThrow])](#TDXApi+patchData)
    * [.updateData(datasetId, data, [upsert], [doNotThrow])](#TDXApi+updateData) ⇒ [<code>CommandResult</code>](#CommandResult)
    * [.updateDataByQuery(datasetId, query, [doNotThrow])](#TDXApi+updateDataByQuery)
    * [.deleteDatabotHost(payload)](#TDXApi+deleteDatabotHost)
    * [.deleteDatabotInstance(instanceId)](#TDXApi+deleteDatabotInstance)
    * [.getDatabotInstance(instanceId)](#TDXApi+getDatabotInstance)
    * [.getDatabotInstanceOutput(instanceId, [processId])](#TDXApi+getDatabotInstanceOutput)
    * [.getDatabotInstanceStatus(instanceId)](#TDXApi+getDatabotInstanceStatus)
    * [.registerDatabotHost(payload)](#TDXApi+registerDatabotHost)
    * [.sendDatabotHostCommand(command, hostId, [hostIp], [hostPort], [payload])](#TDXApi+sendDatabotHostCommand)
    * [.startDatabotInstance(databotId, payload)](#TDXApi+startDatabotInstance)
    * [.abortDatabotInstance(instanceId)](#TDXApi+abortDatabotInstance)
    * [.stopDatabotInstance(instanceId, mode)](#TDXApi+stopDatabotInstance)
    * [.updateDatabotHostStatus(payload)](#TDXApi+updateDatabotHostStatus)
    * [.writeDatabotHostInstanceOutput(output)](#TDXApi+writeDatabotHostInstanceOutput)
    * [.addZoneConnection(options)](#TDXApi+addZoneConnection)
    * [.deleteZoneConnection(id)](#TDXApi+deleteZoneConnection)
    * [.rollbackCommand()](#TDXApi+rollbackCommand)
    * [.createTDXToken(username, [ip], [ttl])](#TDXApi+createTDXToken) ⇒ <code>object</code>
    * [.exchangeTDXToken(token, [validateIP], [exchangeIP], [ttl])](#TDXApi+exchangeTDXToken) ⇒ <code>object</code>
    * [.downloadResource(resourceId)](#TDXApi+downloadResource) ⇒ <code>object</code>
    * [.getAccount(accountId)](#TDXApi+getAccount) ⇒ [<code>Zone</code>](#Zone)
    * [.getAccounts(filter)](#TDXApi+getAccounts) ⇒ [<code>Array.&lt;Zone&gt;</code>](#Zone)
    * [.getAggregateDataStream(datasetId, pipeline, [ndJSON])](#TDXApi+getAggregateDataStream) ⇒ <code>object</code>
    * [.getAggregateData(datasetId, pipeline, [ndJSON])](#TDXApi+getAggregateData) ⇒ [<code>DatasetData</code>](#DatasetData)
    * [.getAuthenticatedAccount()](#TDXApi+getAuthenticatedAccount) ⇒ <code>object</code>
    * [.getDataStream(datasetId, [filter], [projection], [options], [ndJSON])](#TDXApi+getDataStream) ⇒ <code>object</code>
    * [.getData(datasetId, [filter], [projection], [options], [ndJSON])](#TDXApi+getData) ⇒ [<code>DatasetData</code>](#DatasetData)
    * [.getNDData()](#TDXApi+getNDData)
    * ~~[.getDatasetDataStream(datasetId, [filter], [projection], [options], [ndJSON])](#TDXApi+getDatasetDataStream) ⇒ <code>object</code>~~
    * ~~[.getDatasetData(datasetId, [filter], [projection], [options], [ndJSON])](#TDXApi+getDatasetData) ⇒ [<code>DatasetData</code>](#DatasetData)~~
    * [.getDataCount(datasetId, [filter])](#TDXApi+getDataCount)
    * ~~[.getDatasetDataCount(datasetId, [filter])](#TDXApi+getDatasetDataCount)~~
    * [.getDistinct(datasetId, key, [filter])](#TDXApi+getDistinct) ⇒ <code>Array.&lt;object&gt;</code>
    * [.getResource(resourceId, [noThrow])](#TDXApi+getResource) ⇒ [<code>Resource</code>](#Resource)
    * [.getResourceAccess(resourceId)](#TDXApi+getResourceAccess) ⇒ [<code>Array.&lt;ResourceAccess&gt;</code>](#ResourceAccess)
    * [.getResourceAncestors(resourceId)](#TDXApi+getResourceAncestors) ⇒ [<code>Array.&lt;Resource&gt;</code>](#Resource)
    * [.getResources([filter], [projection], [options])](#TDXApi+getResources) ⇒ [<code>Array.&lt;Resource&gt;</code>](#Resource)
    * [.getResourcesWithSchema(schemaId)](#TDXApi+getResourcesWithSchema) ⇒ [<code>Array.&lt;Resource&gt;</code>](#Resource)
    * [.getTDXToken(tdx)](#TDXApi+getTDXToken) ⇒ <code>string</code>
    * [.getZone(accountId)](#TDXApi+getZone) ⇒ [<code>Zone</code>](#Zone)
    * [.isInGroup(accountId, groupId)](#TDXApi+isInGroup)
    * [.validateTDXToken(token, [ip])](#TDXApi+validateTDXToken) ⇒ <code>object</code>

<a name="new_TDXApi_new"></a>

### new TDXApi(config)
Create a TDXApi instance


| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | the TDX configuration for the remote TDX |
| [config.tdxServer] | <code>string</code> | the URL of the TDX auth server, e.g. https://tdx.nqminds.com. Usually this is the only host parameter needed, as long as the target TDX conforms to the standard service naming conventions e.g. https://[service].[tdx-domain].com. In this case the individual service hosts can be derived from the tdxHost name. Optionally, you can specify each individual service host (see below). Note you only need to provide the host for services you intend to use. For example, if you only need query services, just provide the query host. |
| [config.commandServer] | <code>string</code> | the URL of the TDX command service, e.g. https://cmd.nqminds.com |
| [config.queryServer] | <code>string</code> | the URL of the TDX query service, e.g. https://q.nqminds.com |
| [config.databotServer] | <code>string</code> | the URL of the TDX databot service, e.g. https://databot.nqminds.com |
| [config.accessToken] | <code>string</code> | an access token that will be used to authorise commands and queries. Alternatively you can use the authenticate method to acquire a token. |
| [config.accessTokenTTL] | <code>number</code> | the TTL in seconds of the access token created when authenticating. |
| [config.doNotThrow] | <code>bool</code> | set to prevent throwing response errors. They will be returned in the [CommandResult](#CommandResult) object. This was set by default prior to 0.5.x |

**Example** *(standard usage)*  
```js
import TDXApi from "nqm-api-tdx";
const api = new TDXApi({tdxServer: "https://tdx.acme.com"});
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
| [ttl] | <code>number</code> | <code>3600</code> | the Time-To-Live of the token in seconds, default is 1 hour. Will default to config.accessTokenTTL if not given here. |

**Example** *(authenticate using a share key and secret)*  
```js
tdxApi.authenticate("DKJG8dfg", "letmein");
```
**Example** *(authenticate using custom ttl of 2 hours)*  
```js
tdxApi.authenticate("DKJG8dfg", "letmein", 7200);
```
<a name="TDXApi+addAccount"></a>

### tdxApi.addAccount(options, [wait]) ⇒ [<code>CommandResult</code>](#CommandResult)
Adds an account to the TDX. An account can be an e-mail based user account, a share key (token) account,
a databot host, an application, or an account-set (user group).

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  | new account options |
| options.accountType | <code>string</code> |  | the type of account, one of ["user", "token"] |
| [options.approved] | <code>bool</code> |  | account is pre-approved (reserved for system use only) |
| [options.authService] | <code>string</code> |  | the authentication type, one of ["local", "oauth:google", "oauth:github"]. Required for user-based accounts. Ignored for non-user accounts. |
| [options.displayName] | <code>string</code> |  | the human-friendly display name of the account, e.g. "Toby's share key" |
| [options.expires] | <code>number</code> |  | a timestamp at which the account expires and will no longer be granted a token |
| [options.key] | <code>string</code> |  | the account secret. Required for all but oauth-based account types. |
| [options.owner] | <code>string</code> |  | the owner of the account. |
| [options.scratchAccess] | <code>bool</code> |  | indicates this account can create resources in the owners scratch folder. Ignored for all accounts except share key (token) accounts. Is useful for databots that need to create intermediate or temporary resources without specifying a parent resource - if no parent resource is given when a resource is created and scratch access is enabled, the resource will be created in the owner's scratch folder. |
| [options.settings] | <code>object</code> |  | free-form JSON object for user data. |
| [options.username] | <code>string</code> |  | the username of the new account. Required for user-based accounts, and should be the account e-mail address. Can be omitted for non-user accounts, and will be auto-generated. |
| [options.verified] | <code>bool</code> |  | account is pre-verified (reserved for system use only) |
| [options.whitelist] | <code>Array.&lt;string&gt;</code> |  | a list of IP addresses. Tokens will only be granted if the requesting IP address is in this list |
| [wait] | <code>bool</code> | <code>false</code> | flag indicating this method will wait for the account to be fully created before returning. |

<a name="TDXApi+addAccountApplicationConnection"></a>

### tdxApi.addAccountApplicationConnection(accountId, applicationId, [wait])
Adds the application/user connection resource. The authenticated token must belong to the application.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| accountId | <code>string</code> |  | the account id |
| applicationId | <code>string</code> |  | the application id |
| [wait] | <code>bool</code> | <code>true</code> | whether or not to wait for the projection to catch up. |

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
| options.targetOwner | <code>string</code> | the account on the target TDX that is trusted, e.g. `alice@mail.com/tdx.nqminds.com`. |

<a name="TDXApi+addResource"></a>

### tdxApi.addResource(options, [wait])
Adds a resource to the TDX.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  | details of the resource to be added. |
| [options.basedOnSchema] | <code>string</code> | <code>&quot;dataset&quot;</code> | the id of the schema on which this resource will be based. |
| [options.derived] | <code>object</code> |  | definition of derived filter, implying this resource is a view on an existing dataset. |
| [options.derived.filter] | <code>object</code> |  | the (read) filter to apply, in mongodb query format, e.g. `{"temperature": {"$gt": 15}}` will mean that only data with a temperature value greater than 15 will be available in this view. The filter can be any arbitrarily complex mongodb query. Use the placeholder `"@@_identity_@@"` to indicate that the identity of the currently authenticated user should be substituted. For example, if the user `bob@acme.com/tdx.acme.com` is currently authenticated, a filter of `{"username":  "@@_identity_@@"}` will resolve at runtime to `{"username": "bob@acme.com/tdx.acme.com"}`. |
| [options.derived.projection] | <code>object</code> |  | the (read) projection to apply, in mongodb projection format, e.g. `{"timestamp": 1, "temperature": 1}` implies only the 'timestamp' and 'temperature' properties will be returned. |
| [options.derived.source] | <code>string</code> |  | the id of the source dataset on which to apply the filters and projections. |
| [options.derived.writeFilter] | <code>object</code> |  | the write filter to apply, in mongodb query format. This controls what data can be written to the underlying source dataset. For example, a write filter of `{"temperature": {"$lt": 40}}` means that attempts to write a temperature value greater than or equal to `40` will fail. The filter can be any arbitrarily complex mongodb query. |
| [options.derived.writeProjection] | <code>object</code> |  | the write projection to apply, in mongodb projection format. This controls what properties can be written to the underlying dataset. For example, a write projection of `{"temperature": 1}` means that only the temperature field can be written, and attempts to write data to other properties will fail. To allow a view to create new data in the underlying dataset, the primary key fields must be included in the write projection. |
| [options.description] | <code>string</code> |  | a description for the resource. |
| [options.id] | <code>string</code> |  | the requested ID of the new resource. Must be unique. Will be auto-generated if omitted (recommended). |
| options.name | <code>string</code> |  | the name of the resource. Must be unique in the parent folder. |
| [options.meta] | <code>object</code> |  | a free-form object for storing metadata associated with this resource. |
| [options.parentId] | <code>string</code> |  | the id of the parent resource. If omitted, will default to the appropriate root folder based on the type of resource being created. |
| [options.provenance] | <code>string</code> |  | a description of the provenance of the resource. Markdown format is supported. |
| [options.queryProxy] | <code>string</code> |  | a url or IP address that will handle all queries to this resource |
| [options.schema] | <code>object</code> |  | optional schema definition. |
| [options.shareMode] | <code>string</code> |  | the share mode assigned to the new resource. One of [`"pw"`, `"pr"`, `"tr"`], corresponding to "public read/write", "public read/trusted write", "trusted only". |
| [options.tags] | <code>Array.&lt;string&gt;</code> |  | a list of tags to associate with the resource. |
| [options.textContent] | <code>string</code> |  | the text content for the resource. Only applicable to text content based resources. |
| [wait] | <code>bool</code> \| <code>string</code> | <code>false</code> | indicates if the call should wait for the index to be built before it returns. You can pass a string here to indicate the status you want to wait for, default is 'built'. |

**Example** *(usage)*  
```js
// Creates a dataset resource in the authenticated users' scratch folder. The dataset stores key/value pairs
// where the `key` property is the primary key and the `value` property can take any JSON value.
tdxApi.addResource({
  name: "resource #1",
  schema: {
    dataSchema: {
      key: "string",
      value: {}
    },
    uniqueIndex: {key: 1}
  }
})
```
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
| sourceId | <code>string</code> | The id of the resource acting as the source of the access. This is usually the same as the target `resourceId`, but can also be a parent resource. For example, if write access is granted with the sourceId set to be a parent, then if the permission is revoked from the parent resource it will also be revoked from this resource. |
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

<a name="TDXApi+deleteManyResources"></a>

### tdxApi.deleteManyResources(resourceList) ⇒ [<code>CommandResult</code>](#CommandResult)
Permanently deletes a list of resources.
Will fail **all** deletes if any of the permission checks fail.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceList | [<code>Array.&lt;Resource&gt;</code>](#Resource) | The list of resources to delete. Note only the `id` property of each resource is required. |

<a name="TDXApi+fileUpload"></a>

### tdxApi.fileUpload(resourceId, file, [stream], [compressed], [base64Encoded])
Upload a file to a resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| resourceId | <code>string</code> |  | The id of the destination resource. |
| file | <code>object</code> |  | The file to upload, obtained from an `<input type="file">` element. |
| [stream] | <code>bool</code> | <code>false</code> | Flag indicating whether the call should return a stream allowing callees to monitor progress. |
| [compressed] | <code>bool</code> | <code>false</code> | Flag indicating the file should be decompressed after upload. ZIP format only. |
| [base64Encoded] | <code>bool</code> | <code>false</code> | = Flag indicating the file should be decoded from base64 after upload. |

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

<a name="TDXApi+setResourceImporting"></a>

### tdxApi.setResourceImporting(resourceId, importing) ⇒ [<code>CommandResult</code>](#CommandResult)
Set the resource import flag.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | The id of the dataset-based resource. |
| importing | <code>boolean</code> | Indicates the state of the import flag. |

<a name="TDXApi+setResourceSchema"></a>

### tdxApi.setResourceSchema(resourceId, schema) ⇒ [<code>CommandResult</code>](#CommandResult)
Set the resource schema.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | The id of the dataset-based resource. |
| schema | <code>object</code> | The new schema definition. TODO - document |

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

<a name="TDXApi+setResourceTextContent"></a>

### tdxApi.setResourceTextContent(resourceId, textContent)
Set the text for a text-content based resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | The resource id. |
| textContent | <code>string</code> | The text content to set. |

**Example** *(usage)*  
```js
// Sets the text content for a text-html resource.
tdxApi.setResourceTextContent(
  "HyeqJgVdJ7",
  "<html><body><p>Hello World</p></body></html>"
);
```
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
| [update.meta] | <code>object</code> |  |
| [update.name] | <code>string</code> |  |
| [update.overwrite] | <code>bool</code> | set this flag to overwrite existing data rather than merging (default). This currently only applies to the `meta` property. |
| [update.provenance] | <code>string</code> |  |
| [update.queryProxy] | <code>string</code> |  |
| [update.tags] | <code>array</code> |  |
| [update.textContent] | <code>string</code> | see also [setResourceTextContent](#TDXApi+setResourceTextContent) |

<a name="TDXApi+addData"></a>

### tdxApi.addData(datasetId, data, [doNotThrow])
Add data to a dataset resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| datasetId | <code>string</code> |  | The id of the dataset-based resource to add data to. |
| data | <code>object</code> \| <code>array</code> |  | The data to add. Must conform to the schema defined by the resource metadata. |
| [doNotThrow] | <code>bool</code> | <code>false</code> | set to override default error handling. See [TDXApi](#TDXApi). Supports creating an individual document or many documents. |

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

### tdxApi.deleteData(datasetId, data, [doNotThrow])
Deletes data from a dataset-based resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| datasetId | <code>string</code> |  | The id of the dataset-based resource to delete data from. |
| data | <code>object</code> \| <code>array</code> |  | The primary key data to delete. |
| [doNotThrow] | <code>bool</code> | <code>false</code> | set to override default error handling. See [TDXApi](#TDXApi). |

<a name="TDXApi+deleteDataByQuery"></a>

### tdxApi.deleteDataByQuery(datasetId, query, [doNotThrow])
Deletes data from a dataset-based resource using a query to specify the documents to be deleted.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| datasetId | <code>string</code> |  | The id of the dataset-based resource to delete data from. |
| query | <code>object</code> |  | The query that specifies the data to delete. All documents matching the query will be deleted. |
| [doNotThrow] | <code>bool</code> | <code>false</code> | set to override default error handling. See [TDXApi](#TDXApi). |

**Example**  
```js
// Delete all documents with English lsoa.
tdxApi.deleteDataByQuery(myDatasetId, {lsoa: {$regex: "E*"}});
```
<a name="TDXApi+patchData"></a>

### tdxApi.patchData(datasetId, data, [doNotThrow])
Patches data in a dataset resource. Uses the [JSON patch](https://tools.ietf.org/html/rfc6902) format,
which involves defining the primary key data followed by a flexible update specification.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| datasetId | <code>string</code> |  | The id of the dataset-based resource to update. |
| data | <code>object</code> |  | The patch definition. |
| data.__update | <code>object</code> \| <code>array</code> |  | An array of JSON patch specifications. |
| [doNotThrow] | <code>bool</code> | <code>false</code> | set to override default error handling. See [TDXApi](#TDXApi). |

**Example** *(patch a single value in a single document)*  
```js
tdxApi.patchData(myDatasetId, {lsoa: "E000001", __update: [{path: "/count", op: "replace", value: 948}]});
```
**Example** *(patch a more than one value in a single document)*  
```js
tdxApi.patchData(myDatasetId, {lsoa: "E000001", __update: [
  {path: "/count", op: "replace", value: 948}
  {path: "/modified", op: "add", value: Date.now()}
]});
```
<a name="TDXApi+updateData"></a>

### tdxApi.updateData(datasetId, data, [upsert], [doNotThrow]) ⇒ [<code>CommandResult</code>](#CommandResult)
Updates data in a dataset resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Returns**: [<code>CommandResult</code>](#CommandResult) - - Use the result property to check for errors.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| datasetId | <code>string</code> |  | The id of the dataset-based resource to update. |
| data | <code>object</code> \| <code>array</code> |  | The data to update. Must conform to the schema defined by the resource metadata. Supports updating individual or multiple documents. |
| [upsert] | <code>bool</code> | <code>false</code> | Indicates the data should be created if no document is found matching the |
| [doNotThrow] | <code>bool</code> | <code>false</code> | set to override default error handling. See [TDXApi](#TDXApi). primary key. |

**Example** *(update an existing document)*  
```js
tdxApi.updateData(myDatasetId, {lsoa: "E000001", count: 488});
```
**Example** *(upsert a document)*  
```js
// Will create a document if no data exists matching key 'lsoa': "E000004"
tdxApi.updateData(myDatasetId, {lsoa: "E000004", count: 288}, true);
```
<a name="TDXApi+updateDataByQuery"></a>

### tdxApi.updateDataByQuery(datasetId, query, [doNotThrow])
Updates data in a dataset-based resource using a query to specify the documents to be updated.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| datasetId | <code>string</code> |  | The id of the dataset-based resource to update data in. |
| query | <code>object</code> |  | The query that specifies the data to update. All documents matching the |
| [doNotThrow] | <code>bool</code> | <code>false</code> | set to override default error handling. See [TDXApi](#TDXApi). query will be updated. |

**Example**  
```js
// Update all documents with English lsoa, setting `count` to 1000.
tdxApi.updateDataByQuery(myDatasetId, {lsoa: {$regex: "E*"}}, {count: 1000});
```
<a name="TDXApi+deleteDatabotHost"></a>

### tdxApi.deleteDatabotHost(payload)
Deletes one or more hosts, depending on the given parameters. E.g. if just a `hostId` is given, all hosts
will be deleted with that id. If an ip address is also given, all hosts with the id on that ip address will
be deleted and so on. Note that hosts can only be deleted if they are in the `offline` status.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> | The definition of the host(s) to delete. Can be an array of objects or a single object |
| payload.hostId | <code>string</code> | The id of the hosts to be deleted. |
| [payload.hostIp] | <code>string</code> | The optional ip of the hosts to be deleted. |
| [payload.hostPort] | <code>number</code> | The optional port number of the host to be deleted. |

<a name="TDXApi+deleteDatabotInstance"></a>

### tdxApi.deleteDatabotInstance(instanceId)
Deletes a databot instance and all output/debug data associated with it.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| instanceId | <code>Array.&lt;string&gt;</code> | The id(s) of the instances to delete. Can be an array of instance ids or an individual string id |

<a name="TDXApi+getDatabotInstance"></a>

### tdxApi.getDatabotInstance(instanceId)
Gets databot instance data for the given instance id.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| instanceId | <code>string</code> | The id of the instance to retrieve. |

<a name="TDXApi+getDatabotInstanceOutput"></a>

### tdxApi.getDatabotInstanceOutput(instanceId, [processId])
Get databot instance output.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| instanceId | <code>string</code> | The instance id to retrieve output for. |
| [processId] | <code>string</code> | Optional process id. If omitted, output for all instance processes will be returned. |

<a name="TDXApi+getDatabotInstanceStatus"></a>

### tdxApi.getDatabotInstanceStatus(instanceId)
Get databot instance status.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| instanceId | <code>string</code> | The id of the databot instance for which status is retrieved. |

<a name="TDXApi+registerDatabotHost"></a>

### tdxApi.registerDatabotHost(payload)
Registers a databot host with the TDX. Once registered, a host is eligible to receive commands from the TDX.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> | The databot host identifier payload. |
| payload.port | <code>number</code> | the port number the host is listening on. |
| payload.version | <code>string</code> | the databot host software version. |
| payload.hostStatus | <code>string</code> | the current status of the host, "idle" or "busy". |
| [payload.ip] | <code>string</code> | optional ip address of the host. Usually the TDX can deduce this from the incoming request. |

**Example** *(register a databot host)*  
```js
tdxApi.registerDatabotHost({version: "0.3.11", port: 2312, hostStatus: "idle"});
```
<a name="TDXApi+sendDatabotHostCommand"></a>

### tdxApi.sendDatabotHostCommand(command, hostId, [hostIp], [hostPort], [payload])
Sends a command to a databot host. Reserved for system use.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | The command to send. Must be one of ["stopHost", "updateHost", "runInstance", "stopInstance", "clearInstance"] |
| hostId | <code>string</code> | The id of the host. |
| [hostIp] | <code>string</code> | The ip address of the host. If omitted, the command will be sent to all host ip addresses. |
| [hostPort] | <code>number</code> | The port number of the host. If omitted, the command will be sent to all host ports. |
| [payload] | <code>object</code> | The command payload. |

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

<a name="TDXApi+abortDatabotInstance"></a>

### tdxApi.abortDatabotInstance(instanceId)
Aborts a running databot instance.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| instanceId | <code>string</code> | The id of the instance to abort. |

<a name="TDXApi+stopDatabotInstance"></a>

### tdxApi.stopDatabotInstance(instanceId, mode)
Terminates or pauses a running databot instance.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| instanceId | <code>string</code> | The id of the instance to terminate or pause. |
| mode | <code>string</code> | One of [`"stop"`, `"pause"`, `"resume"`] |

<a name="TDXApi+updateDatabotHostStatus"></a>

### tdxApi.updateDatabotHostStatus(payload)
Updates a databot host status.

n.b. the response to this request will contain any commands from the TDX that the host should action (
[see commands](https://github.com/nqminds/nqm-databots/tree/master/packages/nqm-databot-host#tdx-command-format)).

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> | The databot host status payload. |
| payload.port | <code>number</code> | The port number on which the host is listening. |
| payload.hostStatus | <code>string</code> | The current host status, either "idle" or "busy". |
| [payload.ip] | <code>string</code> | optional ip address of the host. Usually the TDX can deduce this from the incoming request. |

**Example** *(update databot host status)*  
```js
tdxApi.updateDatabotHostStatus({port: 2312, hostStatus: "idle"});
```
<a name="TDXApi+writeDatabotHostInstanceOutput"></a>

### tdxApi.writeDatabotHostInstanceOutput(output)
Stores databot instance output on the TDX.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| output | <code>object</code> | The output payload for the databot instance. |

<a name="TDXApi+addZoneConnection"></a>

### tdxApi.addZoneConnection(options)
Adds a zone connection to a remote TDX. The details for the connection should be retrieved by a call to the
certificate endpoint for the TDX, e.g. https://tdx.nqminds.com/certficate.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The zone connection details |
| options.owner | <code>string</code> | The owner of the zone connection. Must be the same as the authenticated account. |
| options.tdxServer | <code>string</code> | The URL of the target TDX auth server, e.g. https://tdx.nqminds.com |
| [options.commandServer] | <code>string</code> | The URL of the target TDX command server, e.g. https://cmd.nqminds.com |
| [options.queryServer] | <code>string</code> | The URL of the target TDX query server, e.g. https://q.nqminds.com |
| [options.ddpServer] | <code>string</code> | The URL of the target TDX ddp server, e.g. https://ddp.nqminds.com |
| [options.databotServer] | <code>string</code> | The URL of the target TDX databot server, e.g. https://databot.nqminds.com |
| [options.displayName] | <code>string</code> | The friendly name of the TDX. |

<a name="TDXApi+deleteZoneConnection"></a>

### tdxApi.deleteZoneConnection(id)
Deletes a zone connection. The authenticated account must own the zone connection.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The id of the zone connection to delete. |

<a name="TDXApi+rollbackCommand"></a>

### tdxApi.rollbackCommand()
AUDIT COMMANDS

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
<a name="TDXApi+createTDXToken"></a>

### tdxApi.createTDXToken(username, [ip], [ttl]) ⇒ <code>object</code>
Creates a client user token (e.g. bound to the browser IP) for an application-user token bound to the
given IP or the currently authenticated token IP. The currently authenticated token ***must*** be an application
token, whereby the application has been authorised by the user and the user has permission to access the
application. The returned token will be bound to the given IP or the IP of the currently authenticated token
(i.e the application server IP).

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Returns**: <code>object</code> - - The new application-user token, bound to the given IP.  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | The users' TDX id. |
| [ip] | <code>string</code> | The optional IP address to bind the user token to. |
| [ttl] | <code>number</code> | The ttl in seconds. |

**Example** *(create token bound to server ip with default TDX ttl)*  
```js
tdxApi.createTDXToken("bob@bob.com/acme.tdx.com");
```
**Example** *(create for specific IP)*  
```js
tdxApi.createTDXToken("bob@bob.com/acme.tdx.com", newClientIP);
```
<a name="TDXApi+exchangeTDXToken"></a>

### tdxApi.exchangeTDXToken(token, [validateIP], [exchangeIP], [ttl]) ⇒ <code>object</code>
Exchanges a client user token (e.g. bound to the browser IP) for an application-user token bound to the
given IP or the currently authenticated token IP. The currently authenticated token ***must*** be an application
token, whereby the application has been authorised by the user and the user has permission to access the
application. The returned token will be bound to the given IP or the IP of the currently authenticated token
(i.e the application server IP).

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Returns**: <code>object</code> - - The new token application-user token, bound to the server IP.  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | The users' TDX auth server token to validate. |
| [validateIP] | <code>string</code> | The optional IP address to validate the user token against. |
| [exchangeIP] | <code>string</code> | The optional IP address to bind the new token to. |
| [ttl] | <code>number</code> | The ttl in seconds. |

**Example** *(validate against current IP)*  
```js
tdxApi.exchangeTDXToken(clientToken);
```
**Example** *(validate against different IP)*  
```js
tdxApi.exchangeTDXToken(clientToken, newClientIP);
```
**Example** *(validate against current IP, bind to a new IP)*  
```js
tdxApi.exchangeTDXToken(clientToken, null, serverIP);
```
<a name="TDXApi+downloadResource"></a>

### tdxApi.downloadResource(resourceId) ⇒ <code>object</code>
Streams the contents of a resource. For dataset-based resources this will stream the dataset contents in newline
delimited JSON (NDJSON). For raw file resources this will stream the raw file contents (zip, raw JSON etc).

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Returns**: <code>object</code> - - Response object, where the response body is a stream object.  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | The id of the resource to be downloaded. |

<a name="TDXApi+getAccount"></a>

### tdxApi.getAccount(accountId) ⇒ [<code>Zone</code>](#Zone)
Gets the details for a given account id.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Returns**: [<code>Zone</code>](#Zone) - zone  

| Param | Type | Description |
| --- | --- | --- |
| accountId | <code>string</code> | the id of the account to be retrieved. |

<a name="TDXApi+getAccounts"></a>

### tdxApi.getAccounts(filter) ⇒ [<code>Array.&lt;Zone&gt;</code>](#Zone)
Gets the details for all peer accounts.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Returns**: [<code>Array.&lt;Zone&gt;</code>](#Zone) - zone  

| Param | Type | Description |
| --- | --- | --- |
| filter | <code>object</code> | query filter. |
| filter.accountType | <code>string</code> | the account type to filter by, e.g. "user", "token", "host" etc. |

**Example** *(Get all databots owned by bob)*  
```js
api.getAccounts({accountType: "host", own: "bob@nqminds.com"})
```
<a name="TDXApi+getAggregateDataStream"></a>

### tdxApi.getAggregateDataStream(datasetId, pipeline, [ndJSON]) ⇒ <code>object</code>
Performs an aggregate query on the given dataset resource, returning a response object with stream in the body

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Returns**: <code>object</code> - - Response object, where the response body is a stream object.  

| Param | Type | Description |
| --- | --- | --- |
| datasetId | <code>string</code> | The id of the dataset-based resource to perform the aggregate query on. |
| pipeline | <code>object</code> \| <code>string</code> | The aggregate pipeline, as defined in the [mongodb docs](https://docs.mongodb.com/manual/aggregation/). Can be given as a JSON object or as a stringified JSON object. |
| [ndJSON] | <code>bool</code> | If set, the data is sent in [newline delimited json format](http://ndjson.org/). |

<a name="TDXApi+getAggregateData"></a>

### tdxApi.getAggregateData(datasetId, pipeline, [ndJSON]) ⇒ [<code>DatasetData</code>](#DatasetData)
Performs an aggregate query on the given dataset resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| datasetId | <code>string</code> | The id of the dataset-based resource to perform the aggregate query on. |
| pipeline | <code>object</code> \| <code>string</code> | The aggregate pipeline, as defined in the [mongodb docs](https://docs.mongodb.com/manual/aggregation/). Can be given as a JSON object or as a stringified JSON object. |
| [ndJSON] | <code>bool</code> | If set, the data is sent in [newline delimited json format](http://ndjson.org/). |

<a name="TDXApi+getAuthenticatedAccount"></a>

### tdxApi.getAuthenticatedAccount() ⇒ <code>object</code>
Gets details of the currently authenticated account.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Returns**: <code>object</code> - - Details of the authenticated account.  
<a name="TDXApi+getDataStream"></a>

### tdxApi.getDataStream(datasetId, [filter], [projection], [options], [ndJSON]) ⇒ <code>object</code>
Gets all data from the given dataset resource that matches the filter provided and returns a response object with
stream in the body.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Returns**: <code>object</code> - - Response object, where the response body is a stream object.  

| Param | Type | Description |
| --- | --- | --- |
| datasetId | <code>string</code> | The id of the dataset-based resource. |
| [filter] | <code>object</code> | A mongodb filter object. If omitted, all data will be retrieved. |
| [projection] | <code>object</code> | A mongodb projection object. Should be used to restrict the payload to the minimum properties needed if a lot of data is being retrieved. |
| [options] | <code>object</code> | A mongodb options object. Can be used to limit, skip, sort etc. Note a default `limit` of 1000 is applied if none is given here. |
| [options.nqmMeta] | <code>bool</code> | When set, the resource metadata will be returned along with the dataset data. Can be used to avoid a second call to `getResource`. Otherwise a URL to the metadata is provided. |
| [ndJSON] | <code>bool</code> | If set, the data is sent in [newline delimited json format](http://ndjson.org/). |

<a name="TDXApi+getData"></a>

### tdxApi.getData(datasetId, [filter], [projection], [options], [ndJSON]) ⇒ [<code>DatasetData</code>](#DatasetData)
For structured resources, e.g. datasets, this function gets all data from the given dataset resource that
matches the filter provided.

For non-structured resources such as text-content or raw files etc only the `datasetId` argument is relevant
and this method is equivalent to `downloadResource`.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| datasetId | <code>string</code> | The id of the dataset-based resource. |
| [filter] | <code>object</code> | A mongodb filter object. If omitted, all data will be retrieved. |
| [projection] | <code>object</code> | A mongodb projection object. Should be used to restrict the payload to the minimum properties needed if a lot of data is being retrieved. |
| [options] | <code>object</code> | A mongodb options object. Can be used to limit, skip, sort etc. Note a default `limit` of 1000 is applied if none is given here. |
| [options.nqmMeta] | <code>bool</code> | When set, the resource metadata will be returned along with the dataset data. Can be used to avoid a second call to `getResource`. Otherwise a URL to the metadata is provided. |
| [ndJSON] | <code>bool</code> | If set, the data is sent in [newline delimited json format](http://ndjson.org/). |

<a name="TDXApi+getNDData"></a>

### tdxApi.getNDData()
Sugar for newline delimited data. See `getData` for details.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
<a name="TDXApi+getDatasetDataStream"></a>

### ~~tdxApi.getDatasetDataStream(datasetId, [filter], [projection], [options], [ndJSON]) ⇒ <code>object</code>~~
***Deprecated***

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Returns**: <code>object</code> - - Response object, where the response body is a stream object.  

| Param | Type | Description |
| --- | --- | --- |
| datasetId | <code>string</code> | The id of the dataset-based resource. |
| [filter] | <code>object</code> | A mongodb filter object. If omitted, all data will be retrieved. |
| [projection] | <code>object</code> | A mongodb projection object. Should be used to restrict the payload to the minimum properties needed if a lot of data is being retrieved. |
| [options] | <code>object</code> | A mongodb options object. Can be used to limit, skip, sort etc. Note a default `limit` of 1000 is applied if none is given here. |
| [options.nqmMeta] | <code>bool</code> | When set, the resource metadata will be returned along with the dataset data. Can be used to avoid a second call to `getResource`. Otherwise a URL to the metadata is provided. |
| [ndJSON] | <code>bool</code> | If set, the data is sent in [newline delimited json format](http://ndjson.org/). |

<a name="TDXApi+getDatasetData"></a>

### ~~tdxApi.getDatasetData(datasetId, [filter], [projection], [options], [ndJSON]) ⇒ [<code>DatasetData</code>](#DatasetData)~~
***Deprecated***

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| datasetId | <code>string</code> | The id of the dataset-based resource. |
| [filter] | <code>object</code> | A mongodb filter object. If omitted, all data will be retrieved. |
| [projection] | <code>object</code> | A mongodb projection object. Should be used to restrict the payload to the minimum properties needed if a lot of data is being retrieved. |
| [options] | <code>object</code> | A mongodb options object. Can be used to limit, skip, sort etc. Note a default `limit` of 1000 is applied if none is given here. |
| [options.nqmMeta] | <code>bool</code> | When set, the resource metadata will be returned along with the dataset data. Can be used to avoid a second call to `getResource`. Otherwise a URL to the metadata is provided. |
| [ndJSON] | <code>bool</code> | If set, the data is sent in [newline delimited json format](http://ndjson.org/). |

<a name="TDXApi+getDataCount"></a>

### tdxApi.getDataCount(datasetId, [filter])
Gets a count of the data in a dataset-based resource, after applying the given filter.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| datasetId | <code>string</code> | The id of the dataset-based resource. |
| [filter] | <code>object</code> | An optional mongodb filter to apply before counting the data. |

<a name="TDXApi+getDatasetDataCount"></a>

### ~~tdxApi.getDatasetDataCount(datasetId, [filter])~~
***Deprecated***

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

**Example**  
```js
api.getResource(myResourceId)
 .then((resource) => {
   console.log(resource.name);
 });
```
<a name="TDXApi+getResourceAccess"></a>

### tdxApi.getResourceAccess(resourceId) ⇒ [<code>Array.&lt;ResourceAccess&gt;</code>](#ResourceAccess)
Gets all access the authenticated account has to the given resource id.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Returns**: [<code>Array.&lt;ResourceAccess&gt;</code>](#ResourceAccess) - - Array of ResourceAccess objects.  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | The id of the resource whose access is to be retrieved. |

**Example**  
```js
api.getResourceAccess(myResourceId)
 .then((resourceAccess) => {
   console.log("length of access list: ", resourceAccess.length);
 });
```
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

<a name="TDXApi+isInGroup"></a>

### tdxApi.isInGroup(accountId, groupId)
Determines if the given account is a member of the given group.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| accountId | <code>string</code> | the id of the account |
| groupId | <code>\*</code> | the id of the group |

<a name="TDXApi+validateTDXToken"></a>

### tdxApi.validateTDXToken(token, [ip]) ⇒ <code>object</code>
Validates the given token was signed by this TDX, and returns the decoded token data.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  
**Returns**: <code>object</code> - - The decoded token data.  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | The TDX auth server token to validate. |
| [ip] | <code>string</code> | The optional IP address to validate against. |

<a name="TDXApiError"></a>

## TDXApiError : <code>Error</code>
The TDX api supplies detailed error information depending on the context of the call.
In some instances, e.g. attempting to retrieve a resource that does not exist, the
error will be a simple `NotFound` string message. In other cases, e.g. attempting
to update 100 documents in a single call, the error will supply details for each
document update that failed, such as the primary key of the document and the reason
for the failure.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | "TDXApiError", indicating the error originated from this library. |
| code | <code>number</code> | The HTTP response status code, e.g. 401 |
| message | <code>string</code> | *Deprecated* - A string-encoded form of the error, essentially a JSON stringified copy of the entire error object. This is included for legacy reasons and may be removed in a future release. |
| from | <code>string</code> | Usually the name of the API call that originated the error, e.g. updateData |
| stack | <code>string</code> | the stack trace |
| failure | <code>object</code> | an object containing the error information as received from the TDX |
| failure.code | <code>string</code> | the TDX short error code, e.g. NotFound, PermissionDenied etc. |
| failure.message | <code>string</code> \| <code>array</code> | details of the failure. For simple cases this will be a string, e.g. `resource not found: KDiEI3k_`. In other instance this will be an array of objects describing each error. See the example below showing a failed attempt to update 2 documents. One of the errors is a simple document not found and the other is a validation error giving details of the exact path in the document that failed validation. |

**Example** *(&#x60;failure&#x60; for simple query error)*  
```js
failure: {
 code: "NotFound",
 message: "resource not found: KDiEI3k_"
}
```
**Example** *(&#x60;failure&#x60; for complex data update error)*  
```js
failure: {
 code: "BadRequestError",
 message: [
   {
     key: {id: "foo"},
     error: {
       message: "document not found matching key 'foo'"
     }
   },
   {
     key: {id: "bar"},
     error: {
       message: "'hello' is not a valid enum value",
       name: "ValidatorError",
       kind: "enum"
       path: "value"
     }
   }
 ]
}
```
<a name="CommandResult"></a>

## CommandResult : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| commandId | <code>string</code> | The auto-generated unique id of the command. |
| response | <code>object</code> \| <code>string</code> | The response of the command. If a command is sent asynchronously, this will simply be the string `"ack"`. In synchronous mode, this will usually be an object consisting of the primary key of the data that was affected by the command. |
| result | <code>object</code> | Contains success flag and detailed error information when available. |
| result.errors | <code>array</code> | Will contain error information when appropriate. |
| result.ok | <code>array</code> | Contains details of each successfully commited document. |

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

<a name="ResourceAccess"></a>

## ResourceAccess : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| aid | <code>string</code> | account id that is the subject of this access |
| by | <code>string</code> | comma-delimited list of attribution for this access |
| rid | <code>string</code> | resource id to which this access refers |
| grp | <code>string</code> | indicates the share mode (user groups only) |
| own | <code>string</code> | account that owns the resource |
| par | <code>Array.&lt;string&gt;</code> | the parent(s) of the resource |
| typ | <code>string</code> | the base type of the resource |
| r | <code>Array.&lt;string&gt;</code> | array of resource ids that are the source of read access (e.g. parent) |
| w | <code>Array.&lt;string&gt;</code> | array of resource ids that are the source of write access |

<a name="Zone"></a>

## Zone : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| accountType | <code>string</code> | 
| displayName | <code>string</code> | 
| username | <code>string</code> | 

