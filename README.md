# nqm-api-tdx
nquiringminds Trusted Data Exchange command and query API interface for nodejs clients

## install
```
npm install nqm-api-tdx
```

## test
```
mocha test
```

## usage

```
var TDXApi = require("nqm-api-tdx");

var config = {
  commandHost: "https://cmd.nqminds.com",
  queryHost: "https://q.nqminds.com"  
};

var nqmindsTDX = new TDXApi(config);

// Authenticate using token id and secret (from the toolbox)
nqmindsTDX.authenticate("myTokenID","myTokenSecret", function(err, accessToken) {
  if (err) {

  } else {
    // Create a dataset.
    nqmindsTDX.createDataset({ name: "foo", parentId: "xyzID", basedOnSchema: "dataset"}, function(err,id) {
      
    })
  }  
});
```