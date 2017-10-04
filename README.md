# nqm-api-tdx
nquiringminds Trusted Data Exchange command and query API interface for nodejs and browser clients

## install
```
npm install @nqminds/nqm-api-tdx
```

## test
```
mocha test
```

## usage

### nodejs
```
const TDXApi = require("@nqminds/nqm-api-tdx");
```

### browser
```
import TDXApi from "@nqminds/nqm-api-tdx"
```

## api
[API reference](https://github.com/nqminds/nqm-api-tdx/blob/v0.2.0/api.md).

## build
```
npm run build
```
### generate API reference
```
npm install -g jsdoc-to-markdown
jsdoc2md ./src/api-tdx.js > api.md
```
