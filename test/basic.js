const chai = require("chai");
const expect = chai.expect;

const TDXApi = require("../lib/nqm-api-tdx");
const api = new TDXApi({tdxServer: "https://tdx.nqminds.com"});

describe("authenticate", function() {
  it("athenticates with valid credentials", function() {
    return api.authenticate("BylM-U7Lab", "")
    .then((token) => {
      expect(token).to.exist;
    });
  });
});

describe("resources", function() {
  it("adds and then deletes resource", function() {
    return api.addResource({name: "TestDeleteMe", basedOnSchema: "dataset", parentId:"SygsVtXUT-"})
    .then(({response}) => {
      expect(response).to.exist;
      return api.deleteResource(response.id)
    })
    .then(({response}) => {
      expect(response).to.exist;
    });
  });

  it("sets resource share mode", function() {
    return api.addResource({name: "TestShare", basedOnSchema: "dataset", parentId:"SygsVtXUT-"})
    .then(({response}) => {
      expect(response).to.exist;
      return api.setResourceShareMode(response.id, "pr");
    })
    .then(({response}) => {
      expect(response).to.exist;
      return api.deleteResource(response.id);
    })
    .then((response) => {
      expect(response).to.exist;
    });
  });

  it("suspends and rebuilds index", function() {
    this.timeout(10000); // Suspending and rebuilding index can take a while
    return api.suspendResourceIndex("BkjWkNIpW")
    .then((response) => {
      expect(response).to.exist;
      return api.rebuildResourceIndex("BkjWkNIpW");
    })
    .then((response) => {
      expect(response).to.exist;
    });
  });

  it("downloads a resource", function() {
    return api.downloadResource("Byx79TXUTb")
    .then(({body}) => {
      expect(body.pipe).to.exist; // If we can pipe it's a stream
    });
  });
});

describe("datasets", function() {
  it("adds and then deletes a document in a resource", function() {
    const data = {timestamp: Date.now()};
    return api.addData("BkjWkNIpW", data)
    .then((response) => {
      expect(response).to.exist;
      return api.deleteData("BkjWkNIpW", data);
    })
    .then((response) => {
      expect(response).to.exist;
    });
  });
  it("deletes documents by query", function() {
    return api.addData("BkjWkNIpW", {timestamp: Date.now()})
    .then((response) => {
      expect(response).to.exist;
      return api.deleteDataByQuery("BkjWkNIpW", {timestamp: {$lte: Date.now()}});
    })
    .then((response) => {
      expect(response).to.exist;
    });
  });
  it("streams data", function() {
    return api.getDatasetDataStream("BkjWkNIpW")
    .then(({body}) => {
      expect(body.pipe).to.exist; // If we can pipe it's a stream
    });
  });
  it("gets data", function() {
    return api.getDatasetData("BkjWkNIpW")
    .then(({data}) => {
      expect(data).to.exist;
    });
  });
  it("counts data", function() {
    return api.getDatasetDataCount("BkjWkNIpW")
    .then(({count}) => {
      expect(typeof count).to.equal("number");
    });
  });
  it("truncates resource", function() {
    return api.truncateResource("BkjWkNIpW")
    .then((response) => {
      expect(response).to.exist;
    })
  });

});