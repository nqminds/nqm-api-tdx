# [@nqminds/nqm-api-tdx](https://github.com/nqminds/nqm-api-tdx) *0.5.11*



### src/api-tdx.js


#### new TDXApi() 







##### Properties

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |



##### Returns


- `Void`



#### TDXApi.constructor(config) 

Create a TDXApi instance




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| config | `object`  | - the TDX configuration for the remote TDX | &nbsp; |
| config.tdxServer | `string`  | - the URL of the TDX auth server, e.g. https://tdx.nqminds.com. Usually this is the only host parameter needed, as long as the target TDX conforms to the standard service naming conventions<br>e.g. https://[service].[tdx-domain].com. In this case the individual service hosts can be derived from the tdxHost<br>name. Optionally, you can specify each individual service host (see below). Note you only need to provide the host<br>for services you intend to use. For example, if you only need query services, just provide the query host. | *Optional* |
| config.commandServer | `string`  | - the URL of the TDX command service, e.g. https://cmd.nqminds.com | *Optional* |
| config.queryServer | `string`  | - the URL of the TDX query service, e.g. https://q.nqminds.com | *Optional* |
| config.databotServer | `string`  | - the URL of the TDX databot service, e.g. https://databot.nqminds.com | *Optional* |
| config.accessToken | `string`  | - an access token that will be used to authorise commands and queries. Alternatively you can use the authenticate method to acquire a token. | *Optional* |
| config.accessTokenTTL | `number`  | - the TTL in seconds of the access token created when authenticating. | *Optional* |
| config.doNotThrow | `bool`  | - set to prevent throwing response errors. They will be returned in the {@link CommandResult} object. This was set by default prior to 0.5.x | *Optional* |




##### Examples

```javascript
<caption>standard usage</caption> import TDXApi from "nqm-api-tdx";
const api = new TDXApi({tdxServer: "https://tdx.acme.com"});
```


##### Returns


- `Void`



#### TDXApi.authenticate(id, secret[, ttl&#x3D;3600]) 

Authenticates with the TDX, acquiring an authorisation token.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| id | `string`  | - the account id, or a pre-formed credentials string, e.g. "DKJG8dfg:letmein" | &nbsp; |
| secret | `string`  | - the account secret | &nbsp; |
| ttl&#x3D;3600 | `number`  | - the Time-To-Live of the token in seconds, default is 1 hour. Will default to config.accessTokenTTL if not given here. | *Optional* |




##### Examples

```javascript
<caption>authenticate using a share key and secret</caption> tdxApi.authenticate("DKJG8dfg", "letmein");
```
```javascript
<caption>authenticate using custom ttl of 2 hours</caption> tdxApi.authenticate("DKJG8dfg", "letmein", 7200);
```


##### Returns


- `string`  The access token.



#### TDXApi.addAccount(options[, wait&#x3D;false]) 

Adds an account to the TDX. An account can be an e-mail based user account, a share key (token) account,
a databot host, an application, or an account-set (user group).




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| options | `object`  | - new account options | &nbsp; |
| options.accountType | `string`  | - the type of account, one of ["user", "token"] | &nbsp; |
| options.approved | `bool`  | - account is pre-approved (reserved for system use only) | *Optional* |
| options.authService | `string`  | - the authentication type, one of ["local", "oauth:google", "oauth:github"]. Required for user-based accounts. Ignored for non-user accounts. | *Optional* |
| options.displayName | `string`  | - the human-friendly display name of the account, e.g. "Toby's share key" | *Optional* |
| options.expires | `number`  | - a timestamp at which the account expires and will no longer be granted a token | *Optional* |
| options.key | `string`  | - the account secret. Required for all but oauth-based account types. | *Optional* |
| options.owner | `string`  | - the owner of the account. | *Optional* |
| options.scratchAccess | `bool`  | - indicates this account can create resources in the owners scratch folder. Ignored for all accounts except share key (token) accounts. Is useful for databots that need to create<br>intermediate or temporary resources without specifying a parent resource - if no parent resource is given<br>when a resource is created and scratch access is enabled, the resource will be created in the owner's scratch<br>folder. | *Optional* |
| options.settings | `object`  | - free-form JSON object for user data. | *Optional* |
| options.username | `string`  | - the username of the new account. Required for user-based accounts, and should be the account e-mail address. Can be omitted for non-user accounts, and will be auto-generated. | *Optional* |
| options.verified | `bool`  | - account is pre-verified (reserved for system use only) | *Optional* |
| options.whitelist | `Array.<string>`  | - a list of IP addresses. Tokens will only be granted if the requesting IP address is in this list | *Optional* |
| wait&#x3D;false | `bool`  | - flag indicating this method will wait for the account to be fully created before returning. | *Optional* |




##### Returns


- `CommandResult`  



#### TDXApi.addAccountApplicationConnection(accountId, applicationId[, wait&#x3D;true]) 

Adds the application/user connection resource. The authenticated token must belong to the application.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| accountId | `string`  | - the account id | &nbsp; |
| applicationId | `string`  | - the application id | &nbsp; |
| wait&#x3D;true | `bool`  | - whether or not to wait for the projection to catch up. | *Optional* |




##### Returns


- `Void`



#### TDXApi.approveAccount(username, approved) 

Set account approved status. Reserved for system use.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| username | `string`  | - the full TDX identity of the account. | &nbsp; |
| approved | `bool`  | - account approved status | &nbsp; |




##### Returns


- `Void`



#### TDXApi.deleteAccount(username) 

Delete an account




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| username | `string`  | - the full TDX identity of the account to delete. | &nbsp; |




##### Returns


- `Void`



#### TDXApi.resetAccount(username, key) 

Change account secret.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| username | `string`  | - the full TDX identity of the account. | &nbsp; |
| key | `string`  | - the new secret | &nbsp; |




##### Returns


- `Void`



#### TDXApi.updateAccount(username, options) 

Updates account details. All update properties are optional. See createAccount for full details of
each option.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| username | `string`  | - the full TDX identity of the account to update. | &nbsp; |
| options | `object`  | - the update options | &nbsp; |
| options.displayName | `string`  |  | *Optional* |
| options.key | `string`  |  | *Optional* |
| options.scratchAccess | `bool`  |  | *Optional* |
| options.settings | `object`  |  | *Optional* |
| options.whitelist | `Array.<string>`  |  | *Optional* |




##### Returns


- `Void`



#### TDXApi.verifyAccount(username, approved) 

Set account verified status. Reserved for system use.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| username | `string`  | - the full TDX identity of the account. | &nbsp; |
| approved | `bool`  | - account verified status | &nbsp; |




##### Returns


- `Void`



#### TDXApi.addTrustedExchange(options) 

Adds a data exchange to the list of trusted exchanges known to the current TDX.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| options | `object`  |  | &nbsp; |
| options.owner | `string`  | - the account on this TDX to which the trust relates, e.g. `bob@mail.com/tdx.acme.com` | &nbsp; |
| options.targetServer | `string`  | - the TDX to be trusted, e.g. `tdx.nqminds.com` | &nbsp; |
| options.targetOwner | `string`  | - the account on the target TDX that is trusted, e.g. `alice@mail.com/tdx.nqminds.com`. | &nbsp; |




##### Returns


- `Void`



#### TDXApi.addResource(options[, wait&#x3D;false]) 

Adds a resource to the TDX.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| options | `object`  | - details of the resource to be added. | &nbsp; |
| options.basedOnSchema&#x3D;dataset | `string`  | - the id of the schema on which this resource will be based. | *Optional* |
| options.derived | `object`  | - definition of derived filter, implying this resource is a view on an existing dataset. | *Optional* |
| options.derived.filter | `object`  | - the (read) filter to apply, in mongodb query format, e.g. `{"temperature": {"$gt": 15}}` will mean that only data with a temperature value greater than 15 will be<br>available in this view. The filter can be any arbitrarily complex mongodb query. Use the placeholder<br>`"@@_identity_@@"` to indicate that the identity of the currently authenticated user should be substituted.<br>For example, if the user `bob@acme.com/tdx.acme.com` is currently authenticated, a filter of `{"username":<br> "@@_identity_@@"}` will resolve at runtime to `{"username": "bob@acme.com/tdx.acme.com"}`. | *Optional* |
| options.derived.projection | `object`  | - the (read) projection to apply, in mongodb projection format, e.g. `{"timestamp": 1, "temperature": 1}` implies only the 'timestamp' and 'temperature' properties will be<br>returned. | *Optional* |
| options.derived.source | `string`  | - the id of the source dataset on which to apply the filters and projections. | *Optional* |
| options.derived.writeFilter | `object`  | - the write filter to apply, in mongodb query format. This controls what data can be written to the underlying source dataset. For example, a write filter of<br>`{"temperature": {"$lt": 40}}` means that attempts to write a temperature value greater than or equal to `40`<br>will fail. The filter can be any arbitrarily complex mongodb query. | *Optional* |
| options.derived.writeProjection | `object`  | - the write projection to apply, in mongodb projection format. This controls what properties can be written to the underlying dataset. For example, a write projection of<br>`{"temperature": 1}` means that only the temperature field can be written, and attempts to write data to other<br>properties will fail. To allow a view to create new data in the underlying dataset, the primary key fields<br>must be included in the write projection. | *Optional* |
| options.description | `string`  | - a description for the resource. | *Optional* |
| options.id | `string`  | - the requested ID of the new resource. Must be unique. Will be auto-generated if omitted (recommended). | *Optional* |
| options.name | `string`  | - the name of the resource. Must be unique in the parent folder. | &nbsp; |
| options.meta | `object`  | - a free-form object for storing metadata associated with this resource. | *Optional* |
| options.parentId | `string`  | - the id of the parent resource. If omitted, will default to the appropriate root folder based on the type of resource being created. | *Optional* |
| options.provenance | `string`  | - a description of the provenance of the resource. Markdown format is supported. | *Optional* |
| options.queryProxy | `string`  | - a url or IP address that will handle all queries to this resource | *Optional* |
| options.schema | `object`  | - optional schema definition. | *Optional* |
| options.shareMode | `string`  | - the share mode assigned to the new resource. One of [`"pw"`, `"pr"`, `"tr"`], corresponding to "public read/write", "public read/trusted write", "trusted only". | *Optional* |
| options.tags | `Array.<string>`  | - a list of tags to associate with the resource. | *Optional* |
| options.textContent | `string`  | - the text content for the resource. Only applicable to text content based resources. | *Optional* |
| wait&#x3D;false | `bool` `string`  | - indicates if the call should wait for the index to be built before it returns. You can pass a string here to indicate the status you want to wait for, default is 'built'. | *Optional* |




##### Examples

```javascript
<caption>usage</caption> // Creates a dataset resource in the authenticated users' scratch folder. The dataset stores key/value pairs
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


##### Returns


- `Void`



#### TDXApi.addResourceAccess(resourceId, accountId, sourceId, access) 

Adds read and/or write permission for an account to access a resource. Permission is required
equivalent to that which is being added, e.g. adding write permission requires existing
write access.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - The resource id | &nbsp; |
| accountId | `string`  | - The account id to assign permission to | &nbsp; |
| sourceId | `string`  | - The id of the resource acting as the source of the access. This is usually the same as the target `resourceId`, but can also be a parent resource. For example,<br>if write access is granted with the sourceId set to be a parent, then if the permission is<br>revoked from the parent resource it will also be revoked from this resource. | &nbsp; |
| access | `Array.<string>`  | - The access, one or more of [`"r"`, `"w"`]. Can be an array or an individual string. | &nbsp; |




##### Examples

```javascript
<caption>add access to an account</caption> tdxApi.addResourceAccess(myResourceId, "bob@acme.com/tdx.acme.com", myResourceId, ["r"]);
```


##### Returns


- `Void`



#### TDXApi.deleteResource(resourceId) 

Permanently deletes a resource.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - the id of the resource to delete. Requires write permission to the resource. | &nbsp; |




##### Returns


- `Void`



#### TDXApi.deleteManyResources(resourceIdList) 

Permanently deletes a list of resources.
Will fail **all** deletes if any of the permission checks fail.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceIdList | `Array.<string>`  | - This list of resource ids to delete. | &nbsp; |




##### Returns


- `CommandResult`  



#### TDXApi.fileUpload(resourceId, file[, stream&#x3D;false, compressed&#x3D;false, base64Encoded&#x3D;false]) 

Upload a file to a resource.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - The id of the destination resource. | &nbsp; |
| file | `object`  | - The file to upload, obtained from an `<input type="file">` element. | &nbsp; |
| stream&#x3D;false | `bool`  | - Flag indicating whether the call should return a stream allowing callees to monitor progress. | *Optional* |
| compressed&#x3D;false | `bool`  | - Flag indicating the file should be decompressed after upload. ZIP format only. | *Optional* |
| base64Encoded&#x3D;false | `bool`  | = Flag indicating the file should be decoded from base64 after upload. | *Optional* |




##### Returns


- `Void`



#### TDXApi.moveResource(id, fromParentId, toParentId) 

Move resource from one folder to another. Requires write permission on the resource, the
source parent and the target parent resources.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| id | `string`  | - the id of the resource to move. | &nbsp; |
| fromParentId | `string`  | - the current parent resource to move from. | &nbsp; |
| toParentId | `string`  | - the target folder resource to move to. | &nbsp; |




##### Returns


- `Void`



#### TDXApi.rebuildResourceIndex(resourceId) 

Resets the resource index. This involves deleting existing indexes and rebuilding them. May take
a while depending on the size of any associated dataset and the number and complexity of indexes.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - the id of the resource, requires write permission. | &nbsp; |




##### Returns


- `Void`



#### TDXApi.removeResourceAccess(resourceId, accountId, addedBy, sourceId, access) 

Removes access for an account to a resource. Permission is required
equivalent to that which is being added, e.g. adding write permission requires existing
write access.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - The resource id. | &nbsp; |
| accountId | `string`  | - The account id to remove access from. | &nbsp; |
| addedBy | `string`  | - The account id that originally added the access, probably your account id. | &nbsp; |
| sourceId | `string`  | - The source of the access, usually the resource itself. | &nbsp; |
| access | `Array.<string>`  | - The access, one or more of [`"r"`, `"w"`]. | &nbsp; |




##### Returns


- `Void`



#### TDXApi.setResourceImporting(resourceId, importing) 

Set the resource import flag.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - The id of the dataset-based resource. | &nbsp; |
| importing | `boolean`  | - Indicates the state of the import flag. | &nbsp; |




##### Returns


- `CommandResult`  



#### TDXApi.setResourceSchema(resourceId, schema) 

Set the resource schema.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - The id of the dataset-based resource. | &nbsp; |
| schema | `object`  | - The new schema definition. TODO - document | &nbsp; |




##### Returns


- `CommandResult`  



#### TDXApi.setResourceShareMode(resourceId, shareMode) 

Set the share mode for a resource.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - The resource id. | &nbsp; |
| shareMode | `string`  | - The share mode to set, one or [`"pw"`, `"pr"`, `"tr"`] corresponding to 'public read/write', 'public read, trusted write', 'trusted only'. | &nbsp; |




##### Returns


- `Void`



#### TDXApi.setResourcePermissiveShare(resourceId, allowPermissive) 

Sets the permissive share mode of the resource. Permissive share allows anybody with acces to the resource
to share it with others. If a resource is not in permissive share mode, only the resource owner
can share it with others.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - The resource id. | &nbsp; |
| allowPermissive | `bool`  | - The required permissive share mode. | &nbsp; |




##### Returns


- `Void`



#### TDXApi.setResourceTextContent(resourceId, textContent) 

Set the text for a text-content based resource.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - The resource id. | &nbsp; |
| textContent | `string`  | - The text content to set. | &nbsp; |




##### Examples

```javascript
<caption>usage</caption> // Sets the text content for a text-html resource.
tdxApi.setResourceTextContent(
  "HyeqJgVdJ7",
  "<html><body><p>Hello World</p></body></html>"
);
```


##### Returns


- `Void`



#### TDXApi.suspendResourceIndex(resourceId) 

Suspends the resource index. This involves deleting any existing indexes. Requires write permission. When
a resource index is in `suspended` status, it is not possible to run any queries or updates against
the resource.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - the id of the resource. Requires write permission. | &nbsp; |




##### Returns


- `Void`



#### TDXApi.truncateResource(resourceId) 

Removes all data from the resource. Applicable to dataset-based resources only. This can not be
undone.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - The resource id to truncate. | &nbsp; |




##### Returns


- `Void`



#### TDXApi.updateResource(resourceId, update) 

Modify one or more of the meta data associated with the resource.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - id of the resource to update | &nbsp; |
| update | `object`  | - object containing the properties to update. Can be one or more of those listed below. See the {@link TDXApi#addResource} method for semantics and syntax of each property. | &nbsp; |
| update.derived | `string`  |  | *Optional* |
| update.description | `string`  |  | *Optional* |
| update.meta | `object`  |  | *Optional* |
| update.name | `string`  |  | *Optional* |
| update.overwrite | `bool`  | - set this flag to overwrite existing data rather than merging (default). This currently only applies to the `meta` property. | *Optional* |
| update.provenance | `string`  |  | *Optional* |
| update.queryProxy | `string`  |  | *Optional* |
| update.tags | `array`  |  | *Optional* |
| update.textContent | `string`  | see also {@link TDXApi#setResourceTextContent} | *Optional* |




##### Returns


- `Void`



#### TDXApi.addData(datasetId, data[, doNotThrow&#x3D;false]) 

Add data to a dataset resource.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| datasetId | `string`  | - The id of the dataset-based resource to add data to. | &nbsp; |
| data | `object` `array`  | - The data to add. Must conform to the schema defined by the resource metadata. | &nbsp; |
| doNotThrow&#x3D;false | `bool`  | - set to override default error handling. See {@link TDXApi}. Supports creating an individual document or many documents. | *Optional* |




##### Examples

```javascript
<caption>create an individual document</caption> // Assumes the dataset primary key is 'lsoa'
tdxApi.addData(myDatasetId, {lsoa: "E0000001", count: 398});
```
```javascript
<caption>create multiple documents</caption> tdxApi.addData(myDatasetId, [
 {lsoa: "E0000001", count: 398},
 {lsoa: "E0000002", count: 1775},
 {lsoa: "E0000005", count: 4533},
]);
```


##### Returns


- `Void`



#### TDXApi.deleteData(datasetId, data[, doNotThrow&#x3D;false]) 

Deletes data from a dataset-based resource.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| datasetId | `string`  | - The id of the dataset-based resource to delete data from. | &nbsp; |
| data | `object` `array`  | - The primary key data to delete. | &nbsp; |
| doNotThrow&#x3D;false | `bool`  | - set to override default error handling. See {@link TDXApi}. | *Optional* |




##### Returns


- `Void`



#### TDXApi.deleteDataByQuery(datasetId, query[, doNotThrow&#x3D;false]) 

Deletes data from a dataset-based resource using a query to specify the documents to be deleted.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| datasetId | `string`  | - The id of the dataset-based resource to delete data from. | &nbsp; |
| query | `object`  | - The query that specifies the data to delete. All documents matching the query will be deleted. | &nbsp; |
| doNotThrow&#x3D;false | `bool`  | - set to override default error handling. See {@link TDXApi}. | *Optional* |




##### Examples

```javascript
// Delete all documents with English lsoa.
tdxApi.deleteDataByQuery(myDatasetId, {lsoa: {$regex: "E*"}});
```


##### Returns


- `Void`



#### TDXApi.patchData(datasetId, data[, doNotThrow&#x3D;false]) 

Patches data in a dataset resource. Uses the [JSON patch](https://tools.ietf.org/html/rfc6902) format,
which involves defining the primary key data followed by a flexible update specification.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| datasetId | `string`  | - The id of the dataset-based resource to update. | &nbsp; |
| data | `object`  | - The patch definition. | &nbsp; |
| data.__update | `object` `array`  | - An array of JSON patch specifications. | &nbsp; |
| doNotThrow&#x3D;false | `bool`  | - set to override default error handling. See {@link TDXApi}. | *Optional* |




##### Examples

```javascript
<caption>patch a single value in a single document</caption> tdxApi.patchData(myDatasetId, {lsoa: "E000001", __update: [{path: "/count", op: "replace", value: 948}]});
```
```javascript
<caption>patch a more than one value in a single document</caption> tdxApi.patchData(myDatasetId, {lsoa: "E000001", __update: [
  {path: "/count", op: "replace", value: 948}
  {path: "/modified", op: "add", value: Date.now()}
]});
```


##### Returns


- `Void`



#### TDXApi.updateData(datasetId, data[, upsert&#x3D;false, doNotThrow&#x3D;false]) 

Updates data in a dataset resource.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| datasetId | `string`  | - The id of the dataset-based resource to update. | &nbsp; |
| data | `object` `array`  | - The data to update. Must conform to the schema defined by the resource metadata. Supports updating individual or multiple documents. | &nbsp; |
| upsert&#x3D;false | `bool`  | - Indicates the data should be created if no document is found matching the | *Optional* |
| doNotThrow&#x3D;false | `bool`  | - set to override default error handling. See {@link TDXApi}. primary key. | *Optional* |




##### Examples

```javascript
<caption>update an existing document</caption> tdxApi.updateData(myDatasetId, {lsoa: "E000001", count: 488});
```
```javascript
<caption>upsert a document</caption> // Will create a document if no data exists matching key 'lsoa': "E000004"
tdxApi.updateData(myDatasetId, {lsoa: "E000004", count: 288}, true);
```


##### Returns


- `CommandResult`  - Use the result property to check for errors.



#### TDXApi.updateDataByQuery(datasetId, query[, doNotThrow&#x3D;false]) 

Updates data in a dataset-based resource using a query to specify the documents to be updated.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| datasetId | `string`  | - The id of the dataset-based resource to update data in. | &nbsp; |
| query | `object`  | - The query that specifies the data to update. All documents matching the | &nbsp; |
| doNotThrow&#x3D;false | `bool`  | - set to override default error handling. See {@link TDXApi}. query will be updated. | *Optional* |




##### Examples

```javascript
// Update all documents with English lsoa, setting `count` to 1000.
tdxApi.updateDataByQuery(myDatasetId, {lsoa: {$regex: "E*"}}, {count: 1000});
```


##### Returns


- `Void`



#### TDXApi.deleteDatabotHost(payload) 

Deletes one or more hosts, depending on the given parameters. E.g. if just a `hostId` is given, all hosts
will be deleted with that id. If an ip address is also given, all hosts with the id on that ip address will
be deleted and so on. Note that hosts can only be deleted if they are in the `offline` status.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| payload | `object`  | - The definition of the host(s) to delete. Can be an array of objects or a single object | &nbsp; |
| payload.hostId | `string`  | - The id of the hosts to be deleted. | &nbsp; |
| payload.hostIp | `string`  | - The optional ip of the hosts to be deleted. | *Optional* |
| payload.hostPort | `number`  | - The optional port number of the host to be deleted. | *Optional* |




##### Returns


- `Void`



#### TDXApi.deleteDatabotInstance(instanceId) 

Deletes a databot instance and all output/debug data associated with it.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| instanceId | `Array.<string>`  | - The id(s) of the instances to delete. Can be an array of instance ids or an individual string id | &nbsp; |




##### Returns


- `Void`



#### TDXApi.getDatabotInstance(instanceId) 

Gets databot instance data for the given instance id.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| instanceId | `string`  | - The id of the instance to retrieve. | &nbsp; |




##### Returns


- `Void`



#### TDXApi.getDatabotInstanceOutput(instanceId[, processId]) 

Get databot instance output.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| instanceId | `string`  | - The instance id to retrieve output for. | &nbsp; |
| processId | `string`  | - Optional process id. If omitted, output for all instance processes will be returned. | *Optional* |




##### Returns


- `Void`



#### TDXApi.getDatabotInstanceStatus(instanceId) 

Get databot instance status.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| instanceId | `string`  | - The id of the databot instance for which status is retrieved. | &nbsp; |




##### Returns


- `Void`



#### TDXApi.registerDatabotHost(payload) 

Registers a databot host with the TDX. Once registered, a host is eligible to receive commands from the TDX.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| payload | `object`  | - The databot host identifier payload. | &nbsp; |
| payload.port | `number`  | - the port number the host is listening on. | &nbsp; |
| payload.version | `string`  | - the databot host software version. | &nbsp; |
| payload.hostStatus | `string`  | - the current status of the host, "idle" or "busy". | &nbsp; |
| payload.ip | `string`  | - optional ip address of the host. Usually the TDX can deduce this from the incoming request. | *Optional* |




##### Examples

```javascript
<caption>register a databot host</caption> tdxApi.registerDatabotHost({version: "0.3.11", port: 2312, hostStatus: "idle"});
```


##### Returns


- `Void`



#### TDXApi.sendDatabotHostCommand(command, hostId[, hostIp, hostPort, payload]) 

Sends a command to a databot host. Reserved for system use.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| command | `string`  | - The command to send. Must be one of ["stopHost", "updateHost", "runInstance", "stopInstance", "clearInstance"] | &nbsp; |
| hostId | `string`  | - The id of the host. | &nbsp; |
| hostIp | `string`  | - The ip address of the host. If omitted, the command will be sent to all host ip addresses. | *Optional* |
| hostPort | `number`  | - The port number of the host. If omitted, the command will be sent to all host ports. | *Optional* |
| payload | `object`  | - The command payload. | *Optional* |




##### Returns


- `Void`



#### TDXApi.startDatabotInstance(databotId, payload) 

Starts a databot instance.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| databotId | `string`  | - The id of the databot definition to start. | &nbsp; |
| payload | `object`  | - The instance input and parameters. | &nbsp; |
| payload.authTokenTTL | `number`  | - The time-to-live to use when creating the auth token, in seconds. Will default to the TDX-configured default if not given (usually 1 hour). | *Optional* |
| payload.chunks&#x3D;1 | `number`  | - The number of processes to instantiate. Each will be given the same input data, with only the chunk number varying. | *Optional* |
| payload.debugMode&#x3D;false | `bool`  | - Flag indicating this instance should be run in debug mode, meaning all debug output will be captured and stored on the TDX. n.b. setting this will also restrict the hosts available<br>to run the instance to those that are willing to run in debug mode. | *Optional* |
| payload.description | `string`  | - The description for this instance. | *Optional* |
| payload.inputs | `object`  | - The input data. A free-form object that should conform to the specification in the associated databot definition. | *Optional* |
| payload.name | `string`  | - The name to associate with this instance, e.g. "Male population projection 2017" | *Optional* |
| payload.overwriteExisting | `string`  | - The id of an existing instance that should be overwritten. | *Optional* |
| payload.priority | `number`  | - The priority to assign this instance. Reserved for system use. | *Optional* |
| payload.shareKeyId | `string`  | - The share key to run the databot under. | &nbsp; |
| payload.shareKeySecret | `string`  | - The secret of the share key. Ignored if the share key id refers to a user-based account. | *Optional* |




##### Returns


- `Void`



#### TDXApi.abortDatabotInstance(instanceId) 

Aborts a running databot instance.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| instanceId | `string`  | - The id of the instance to abort. | &nbsp; |




##### Returns


- `Void`



#### TDXApi.stopDatabotInstance(instanceId, mode) 

Terminates or pauses a running databot instance.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| instanceId | `string`  | - The id of the instance to terminate or pause. | &nbsp; |
| mode | `string`  | - One of [`"stop"`, `"pause"`, `"resume"`] | &nbsp; |




##### Returns


- `Void`



#### TDXApi.updateDatabotHostStatus(payload) 

Updates a databot host status.

n.b. the response to this request will contain any commands from the TDX that the host should action (
[see commands](https://github.com/nqminds/nqm-databots/tree/master/packages/nqm-databot-host#tdx-command-format)).




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| payload | `object`  | - The databot host status payload. | &nbsp; |
| payload.port | `number`  | - The port number on which the host is listening. | &nbsp; |
| payload.hostStatus | `string`  | - The current host status, either "idle" or "busy". | &nbsp; |
| payload.ip | `string`  | - optional ip address of the host. Usually the TDX can deduce this from the incoming request. | *Optional* |




##### Examples

```javascript
<caption>update databot host status</caption> tdxApi.updateDatabotHostStatus({port: 2312, hostStatus: "idle"});
```


##### Returns


- `Void`



#### TDXApi.writeDatabotHostInstanceOutput(output) 

Stores databot instance output on the TDX.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| output | `object`  | - The output payload for the databot instance. | &nbsp; |




##### Returns


- `Void`



#### TDXApi.addZoneConnection(options) 

Adds a zone connection to a remote TDX. The details for the connection should be retrieved by a call to the
certificate endpoint for the TDX, e.g. https://tdx.nqminds.com/certficate.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| options | `object`  | - The zone connection details | &nbsp; |
| options.owner | `string`  | - The owner of the zone connection. Must be the same as the authenticated account. | &nbsp; |
| options.tdxServer | `string`  | - The URL of the target TDX auth server, e.g. https://tdx.nqminds.com | &nbsp; |
| options.commandServer | `string`  | - The URL of the target TDX command server, e.g. https://cmd.nqminds.com | *Optional* |
| options.queryServer | `string`  | - The URL of the target TDX query server, e.g. https://q.nqminds.com | *Optional* |
| options.ddpServer | `string`  | - The URL of the target TDX ddp server, e.g. https://ddp.nqminds.com | *Optional* |
| options.databotServer | `string`  | - The URL of the target TDX databot server, e.g. https://databot.nqminds.com | *Optional* |
| options.displayName | `string`  | - The friendly name of the TDX. | *Optional* |




##### Returns


- `Void`



#### TDXApi.deleteZoneConnection(id) 

Deletes a zone connection. The authenticated account must own the zone connection.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| id | `string`  | - The id of the zone connection to delete. | &nbsp; |




##### Returns


- `Void`



#### TDXApi.rollbackCommand() 

AUDIT COMMANDS






##### Returns


- `Void`



#### TDXApi.createTDXToken(username[, ip, ttl]) 

Creates a client user token (e.g. bound to the browser IP) for an application-user token bound to the
given IP or the currently authenticated token IP. The currently authenticated token ***must*** be an application
token, whereby the application has been authorised by the user and the user has permission to access the
application. The returned token will be bound to the given IP or the IP of the currently authenticated token
(i.e the application server IP).




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| username | `string`  | - The users' TDX id. | &nbsp; |
| ip | `string`  | - The optional IP address to bind the user token to. | *Optional* |
| ttl | `number`  | - The ttl in seconds. | *Optional* |




##### Examples

```javascript
<caption>create token bound to server ip with default TDX ttl</caption> tdxApi.createTDXToken("bob@bob.com/acme.tdx.com");
```
```javascript
<caption>create for specific IP</caption> tdxApi.createTDXToken("bob@bob.com/acme.tdx.com", newClientIP);
```


##### Returns


- `object`  - The new application-user token, bound to the given IP.



#### TDXApi.exchangeTDXToken(token[, validateIP, exchangeIP, ttl]) 

Exchanges a client user token (e.g. bound to the browser IP) for an application-user token bound to the
given IP or the currently authenticated token IP. The currently authenticated token ***must*** be an application
token, whereby the application has been authorised by the user and the user has permission to access the
application. The returned token will be bound to the given IP or the IP of the currently authenticated token
(i.e the application server IP).




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| token | `string`  | - The users' TDX auth server token to validate. | &nbsp; |
| validateIP | `string`  | - The optional IP address to validate the user token against. | *Optional* |
| exchangeIP | `string`  | - The optional IP address to bind the new token to. | *Optional* |
| ttl | `number`  | - The ttl in seconds. | *Optional* |




##### Examples

```javascript
<caption>validate against current IP</caption> tdxApi.exchangeTDXToken(clientToken);
```
```javascript
<caption>validate against different IP</caption> tdxApi.exchangeTDXToken(clientToken, newClientIP);
```
```javascript
<caption>validate against current IP, bind to a new IP</caption> tdxApi.exchangeTDXToken(clientToken, null, serverIP);
```


##### Returns


- `object`  - The new token application-user token, bound to the server IP.



#### TDXApi.downloadResource(resourceId) 

Streams the contents of a resource. For dataset-based resources this will stream the dataset contents in newline
delimited JSON (NDJSON). For raw file resources this will stream the raw file contents (zip, raw JSON etc).




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - The id of the resource to be downloaded. | &nbsp; |




##### Returns


- `object`  - Response object, where the response body is a stream object.



#### TDXApi.getAccount(accountId) 

Gets the details for a given account id.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| accountId | `string`  | - the id of the account to be retrieved. | &nbsp; |




##### Returns


- `Zone`  zone



#### TDXApi.getAccounts(filter) 

Gets the details for all peer accounts.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| filter | `object`  | - query filter. | &nbsp; |
| filter.accountType | `string`  | - the account type to filter by, e.g. "user", "token", "host" etc. | &nbsp; |




##### Examples

```javascript
<caption>Get all databots owned by bob</caption> api.getAccounts({accountType: "host", own: "bob@nqminds.com"})
```


##### Returns


- `Array.&lt;Zone&gt;`  zone



#### TDXApi.getAggregateDataStream(datasetId, pipeline[, ndJSON]) 

Performs an aggregate query on the given dataset resource, returning a response object with stream in the body




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| datasetId | `string`  | - The id of the dataset-based resource to perform the aggregate query on. | &nbsp; |
| pipeline | `object` `string`  | - The aggregate pipeline, as defined in the [mongodb docs](https://docs.mongodb.com/manual/aggregation/). Can be given as a JSON object or as a stringified<br>JSON object. | &nbsp; |
| ndJSON | `bool`  | - If set, the data is sent in [newline delimited json format](http://ndjson.org/). | *Optional* |




##### Returns


- `object`  - Response object, where the response body is a stream object.



#### TDXApi.getAggregateData(datasetId, pipeline[, ndJSON]) 

Performs an aggregate query on the given dataset resource.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| datasetId | `string`  | - The id of the dataset-based resource to perform the aggregate query on. | &nbsp; |
| pipeline | `object` `string`  | - The aggregate pipeline, as defined in the [mongodb docs](https://docs.mongodb.com/manual/aggregation/). Can be given as a JSON object or as a stringified<br>JSON object. | &nbsp; |
| ndJSON | `bool`  | - If set, the data is sent in [newline delimited json format](http://ndjson.org/). | *Optional* |




##### Returns


- `DatasetData`  



#### TDXApi.getAuthenticatedAccount() 

Gets details of the currently authenticated account.






##### Returns


- `object`  - Details of the authenticated account.



#### TDXApi.getDataStream(datasetId[, filter, projection, options, ndJSON]) 

Gets all data from the given dataset resource that matches the filter provided and returns a response object with
stream in the body.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| datasetId | `string`  | - The id of the dataset-based resource. | &nbsp; |
| filter | `object`  | - A mongodb filter object. If omitted, all data will be retrieved. | *Optional* |
| projection | `object`  | - A mongodb projection object. Should be used to restrict the payload to the minimum properties needed if a lot of data is being retrieved. | *Optional* |
| options | `object`  | - A mongodb options object. Can be used to limit, skip, sort etc. Note a default `limit` of 1000 is applied if none is given here. | *Optional* |
| options.nqmMeta | `bool`  | - When set, the resource metadata will be returned along with the dataset data. Can be used to avoid a second call to `getResource`. Otherwise a URL to the metadata is provided. | *Optional* |
| ndJSON | `bool`  | - If set, the data is sent in [newline delimited json format](http://ndjson.org/). | *Optional* |




##### Returns


- `object`  - Response object, where the response body is a stream object.



#### TDXApi.getData(datasetId[, filter, projection, options, ndJSON]) 

For structured resources, e.g. datasets, this function gets all data from the given dataset resource that
matches the filter provided.

For non-structured resources such as text-content or raw files etc only the `datasetId` argument is relevant
and this method is equivalent to `downloadResource`.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| datasetId | `string`  | - The id of the dataset-based resource. | &nbsp; |
| filter | `object`  | - A mongodb filter object. If omitted, all data will be retrieved. | *Optional* |
| projection | `object`  | - A mongodb projection object. Should be used to restrict the payload to the minimum properties needed if a lot of data is being retrieved. | *Optional* |
| options | `object`  | - A mongodb options object. Can be used to limit, skip, sort etc. Note a default `limit` of 1000 is applied if none is given here. | *Optional* |
| options.nqmMeta | `bool`  | - When set, the resource metadata will be returned along with the dataset data. Can be used to avoid a second call to `getResource`. Otherwise a URL to the metadata is provided. | *Optional* |
| ndJSON | `bool`  | - If set, the data is sent in [newline delimited json format](http://ndjson.org/). | *Optional* |




##### Returns


- `DatasetData`  



#### TDXApi.getNDData() 

Sugar for newline delimited data. See `getData` for details.






##### Returns


- `Void`



#### TDXApi.getDatasetDataStream(datasetId[, filter, projection, options, ndJSON]) 






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| datasetId | `string`  | - The id of the dataset-based resource. | &nbsp; |
| filter | `object`  | - A mongodb filter object. If omitted, all data will be retrieved. | *Optional* |
| projection | `object`  | - A mongodb projection object. Should be used to restrict the payload to the minimum properties needed if a lot of data is being retrieved. | *Optional* |
| options | `object`  | - A mongodb options object. Can be used to limit, skip, sort etc. Note a default `limit` of 1000 is applied if none is given here. | *Optional* |
| options.nqmMeta | `bool`  | - When set, the resource metadata will be returned along with the dataset data. Can be used to avoid a second call to `getResource`. Otherwise a URL to the metadata is provided. | *Optional* |
| ndJSON | `bool`  | - If set, the data is sent in [newline delimited json format](http://ndjson.org/). | *Optional* |




##### Returns


- `object`  - Response object, where the response body is a stream object.



#### TDXApi.getDatasetData(datasetId[, filter, projection, options, ndJSON]) 






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| datasetId | `string`  | - The id of the dataset-based resource. | &nbsp; |
| filter | `object`  | - A mongodb filter object. If omitted, all data will be retrieved. | *Optional* |
| projection | `object`  | - A mongodb projection object. Should be used to restrict the payload to the minimum properties needed if a lot of data is being retrieved. | *Optional* |
| options | `object`  | - A mongodb options object. Can be used to limit, skip, sort etc. Note a default `limit` of 1000 is applied if none is given here. | *Optional* |
| options.nqmMeta | `bool`  | - When set, the resource metadata will be returned along with the dataset data. Can be used to avoid a second call to `getResource`. Otherwise a URL to the metadata is provided. | *Optional* |
| ndJSON | `bool`  | - If set, the data is sent in [newline delimited json format](http://ndjson.org/). | *Optional* |




##### Returns


- `DatasetData`  



#### TDXApi.getDataCount(datasetId[, filter]) 

Gets a count of the data in a dataset-based resource, after applying the given filter.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| datasetId | `string`  | - The id of the dataset-based resource. | &nbsp; |
| filter | `object`  | - An optional mongodb filter to apply before counting the data. | *Optional* |




##### Returns


- `Void`



#### TDXApi.getDatasetDataCount(datasetId[, filter]) 






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| datasetId | `string`  | - The id of the dataset-based resource. | &nbsp; |
| filter | `object`  | - An optional mongodb filter to apply before counting the data. | *Optional* |




##### Returns


- `Void`



#### TDXApi.getDistinct(datasetId, key[, filter]) 

Gets a list of distinct values for a given property in a dataset-based resource.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| datasetId | `string`  | - The id of the dataset-based resource. | &nbsp; |
| key | `string`  | - The name of the property to use. Can be a property path, e.g. `"address.postcode"`. | &nbsp; |
| filter | `object`  | - An optional mongodb filter to apply. | *Optional* |




##### Returns


- `Array.&lt;object&gt;`  - The distinct values.



#### TDXApi.getResource(resourceId[, noThrow&#x3D;false]) 

Gets the details for a given resource id.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - The id of the resource to retrieve. | &nbsp; |
| noThrow&#x3D;false | `bool`  | - If set, the call won't reject or throw if the resource doesn't exist. | *Optional* |




##### Examples

```javascript
api.getResource(myResourceId)
 .then((resource) => {
   console.log(resource.name);
 });
```


##### Returns


- `Resource`  



#### TDXApi.getResourceAccess(resourceId) 

Gets all access the authenticated account has to the given resource id.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - The id of the resource whose access is to be retrieved. | &nbsp; |




##### Examples

```javascript
api.getResourceAccess(myResourceId)
 .then((resourceAccess) => {
   console.log("length of access list: ", resourceAccess.length);
 });
```


##### Returns


- `Array.&lt;ResourceAccess&gt;`  - Array of ResourceAccess objects.



#### TDXApi.getResourceAncestors(resourceId) 

Gets all resources that are ancestors of the given resource.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| resourceId | `string`  | - The id of the resource whose parents are to be retrieved. | &nbsp; |




##### Returns


- `Array.&lt;Resource&gt;`  



#### TDXApi.getResources([filter, projection, options]) 

Gets the details of all resources that match the given filter.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| filter | `object`  | - A mongodb filter definition | *Optional* |
| projection | `object`  | - A mongodb projection definition, can be used to restrict which properties are returned thereby limiting the payload. | *Optional* |
| options | `object`  | - A mongodb options definition, can be used for limit, skip, sorting etc. | *Optional* |




##### Returns


- `Array.&lt;Resource&gt;`  



#### TDXApi.getResourcesWithSchema(schemaId) 

Retrieves all resources that have an immediate ancestor of the given schema id.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| schemaId | `string`  | - The id of the schema to match, e.g. `"geojson"`. | &nbsp; |




##### Returns


- `Array.&lt;Resource&gt;`  



#### TDXApi.getTDXToken(tdx) 

Retrieves an authorisation token for the given TDX instance




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| tdx | `string`  | - The TDX instance name, e.g. `"tdx.acme.com"`. | &nbsp; |




##### Returns


- `string`  



#### TDXApi.getZone(accountId) 

Gets the details for a given zone (account) id.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| accountId | `string`  | - the id of the zone to be retrieved. | &nbsp; |




##### Returns


- `Zone`  zone



#### TDXApi.isInGroup(accountId, groupId) 

Determines if the given account is a member of the given group.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| accountId | `string`  | - the id of the account | &nbsp; |
| groupId |  | - the id of the group | &nbsp; |




##### Returns


- `Void`



#### TDXApi.validateTDXToken(token[, ip]) 

Validates the given token was signed by this TDX, and returns the decoded token data.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| token | `string`  | - The TDX auth server token to validate. | &nbsp; |
| ip | `string`  | - The optional IP address to validate against. | *Optional* |




##### Returns


- `object`  - The decoded token data.




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
