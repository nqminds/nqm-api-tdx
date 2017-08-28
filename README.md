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
<a name="TDXApi"></a>

## TDXApi
**Kind**: global class  

* [TDXApi](#TDXApi)
    * [new TDXApi(config)](#new_TDXApi_new)
    * [.authenticate(id, secret, [ttl])](#TDXApi+authenticate)
    * [.addAccount(options)](#TDXApi+addAccount)
    * [.updateAccount(username, options)](#TDXApi+updateAccount)
    * [.approveAccount(username, approved)](#TDXApi+approveAccount)
    * [.resetAccount(username, key)](#TDXApi+resetAccount)
    * [.verifyAccount(username, approved)](#TDXApi+verifyAccount)
    * [.deleteAccount(username)](#TDXApi+deleteAccount)
    * [.addTrustedExchange(options)](#TDXApi+addTrustedExchange)
    * [.addResource(options, [wait])](#TDXApi+addResource)
    * [.updateResource(resourceId, update)](#TDXApi+updateResource)
    * [.moveResource(id, fromParentId, toParentId)](#TDXApi+moveResource)
    * [.deleteResource(resourceId)](#TDXApi+deleteResource)
    * [.rebuildResourceIndex(resourceId)](#TDXApi+rebuildResourceIndex)
    * [.suspendResourceIndex(resourceId)](#TDXApi+suspendResourceIndex)
    * [.addResourceAccess(resourceId, accountId, sourceId, access)](#TDXApi+addResourceAccess)

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

<a name="TDXApi+authenticate"></a>

### tdxApi.authenticate(id, secret, [ttl])
Authenticates with the TDX, acquiring an authorisation token.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | the account id, or a pre-formed credentials string, e.g. "DKJG8dfg:letmein" |
| secret | <code>string</code> |  | the account secret |
| [ttl] | <code>number</code> | <code>3600</code> | the Time-To-Live of the token in seconds, default is 1 hour. |

<a name="TDXApi+addAccount"></a>

### tdxApi.addAccount(options)
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

<a name="TDXApi+approveAccount"></a>

### tdxApi.approveAccount(username, approved)
Set account approved status. Reserved for system use.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | the full TDX identity of the account. |
| approved | <code>bool</code> | account approved status |

<a name="TDXApi+resetAccount"></a>

### tdxApi.resetAccount(username, key)
Change account secret.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | the full TDX identity of the account. |
| key | <code>string</code> | the new secret |

<a name="TDXApi+verifyAccount"></a>

### tdxApi.verifyAccount(username, approved)
Set account verified status. Reserved for system use.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | the full TDX identity of the account. |
| approved | <code>bool</code> | account verified status |

<a name="TDXApi+deleteAccount"></a>

### tdxApi.deleteAccount(username)
Delete an account

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | the full TDX identity of the account to delete. |

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

<a name="TDXApi+deleteResource"></a>

### tdxApi.deleteResource(resourceId)
Permanently deletes a resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | the id of the resource to delete. Requires write permission to the resource. |

<a name="TDXApi+rebuildResourceIndex"></a>

### tdxApi.rebuildResourceIndex(resourceId)
Resets the resource index. This involves deleting existing indexes and rebuilding them. May take
a while depending on the size of any associated dataset and the number and complexity of indexes.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | the id of the resource, requires write permission. |

<a name="TDXApi+suspendResourceIndex"></a>

### tdxApi.suspendResourceIndex(resourceId)
Suspends the resource index. This involves deleting any existing indexes. Requires write permission. When
a resource index is in `suspended` status, it is not possible to run any queries or updates against
the resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | the id of the resource. Requires write permission. |

<a name="TDXApi+addResourceAccess"></a>

### tdxApi.addResourceAccess(resourceId, accountId, sourceId, access)
Adds read and/or write permission for an account to access a resource.

**Kind**: instance method of [<code>TDXApi</code>](#TDXApi)  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | the resource id |
| accountId | <code>string</code> | the account id to assign permission to |
| sourceId | <code>string</code> | the id of the resource acting as the source of the access. This is usually the same as the target resourceId, but can also be a parent resource. For example, if write access is granted with the sourceId set to be a parent, then if the permission is  revoked from the parent resource it will also be revoked from this resource. |
| access | <code>Array.&lt;string&gt;</code> | the access, one of [`"r"`, `"w"`] |

