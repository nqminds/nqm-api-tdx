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

## include

### nodejs
```
var TDXApi = require("nqm-api-tdx");
```

### meteor
```
import TDXApi from "nqm-api-tdx/client-api"
```

### web page
Copy client-api.js (generated when you npm install) to your js directory then:
```
<script src="/path/to/client-api.js"></script>
```

## usage
Include in the appropriate manner as shown above

```
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
      
    });
    // Aggregate query
    nqmindsTDX.getAggregateData("datasetId", "pipeline", {options},  function(err, data) {

    });
    // Get data from dataset
    nqmindsTDX.getDatasetData("datasetId", {filter}, {projection}, {options}, function(err, data) {
    
    });
    // Get datasets that match filter
    nqmindsTDX.getDatasets({filter}, {projection}, {options},  function(err,data)  {

    });
    // Truncate -- careful!
    nqmindsTDX.truncateDataset("datasetId", function(err, response) {

    });
    // Add data 
    nqmindsTDX.addDatasetData("datasetId",{data}, function(err, response) {

    });
  }  
});
```
Passing in an existing token:
```
var config = {
  commandHost: "https://cmd.nqminds.com",
  queryHost: "https://q.nqminds.com",
  accessToken: "yourTokenGoesHere  
};
```
