# nqm-api-tdx
nquiringminds Trusted Data Exchange command and query API interface for nodejs clients

## install
npm install nqm-api-tdx

## usage

```
var TDXApi = require("nqm-api-tdx");

var config = {
  baseCommandURL: "https://cmd.nqminds.com",
  baseQueryURL: "https://q.nqminds.com"  
};

var nqmindsTDX = new TDXApi(config);

nqmindsTDX.authenticate("myTokenID","myTokenSecret", function(err, accessToken) {

});
```