var chai = require("chai");
var expect = chai.expect;

var APIModule = require("../lib/api.js");
var testConfig = {
  commandHost: "https://cmd.nqminds.com",
  queryHost: "https://q.nqminds.com"
};
var newConfig = {
  tdxHost: "https://tdx.nqminds.com",
};
var api = new APIModule(newConfig);

describe("authenticate", function() {
  it("fails to authenticate invalid credentials", function(done) {
    api.authenticate("foo","bar",function(err, token) {
      expect(token).to.not.exist;
      expect(err).to.exist;
      done();
    });
  });
  it("authenticates valid credentials", function(done) {
    api.authenticate("ryg94GVkZe","12345",function(err, token) {
      expect(token).to.exist;
      expect(err).to.not.exist;
      done();
    });
  });
});

describe("query", function() {
  it("queries dataset data", function(done) {
    api.query("datasets/NJgMR6EPmg/data", null, null, null, function(err, data) {
      expect(err).to.not.exist;
      expect(data).to.exist;
      done();
    });
  });
});

describe("queryStream", function() {
  it("queries dataset data and streams the response", function(done) {
    var request = api.getDatasetData("rJgyaqJrM", function(err,resp) {
      // Shouldn't get called back when streaming the response.
      expect(false).to.be.true();
      done();
    });
    var fs = require("fs");
    request.pipe(fs.createWriteStream("./stream-test.json")).on("finish",function() {
      var contents = fs.readFileSync("./stream-test.json");
      // console.log(contents.toString());
      var data = JSON.parse(contents);
      expect(data.data.length).to.equal(1000);
      done();
    });
    request.on("error", function(err) {
      expect(err).to.not.exist;
    });
  })
});

describe("data count", function() {
  it("queries dataset data count", function(done) {
    api.getDatasetDataCount("NJgMR6EPmg", function(err, data) {
      expect(err).to.not.exist;
      expect(data).to.exist;
      expect(data.count).to.equal(1520);
      done();
    });
  });
});

describe("get raw file", function() {
  it("gets raw file data", function(done) {
    var request = api.getRawFile("SygmvnAX8");
    var fs = require("fs");
    var str = fs.createWriteStream("./raw-file.json");
    request.pipe(str).on("finish", function() {
      console.log("got raw file: ");
      done();
    });
  });
});

describe("aggregate", function() {
  it("aggregate dataset data", function(done) {
    api.aggregate("datasets/BkWqQQuBo/data", '[{"$match":{"parent_id":"E09000001"}},{"$group":{"_id":null,"id_array":{"$push":"$child_id"}}}]', null, function(err, data) {
      expect(err).to.not.exist;
      expect(data).to.exist;
      done();
    });
  });
});

describe("commands", function() {
  it("creates dataset", function(done) {
    var createOptions = {
      name: "test dataset",
      parentId: "H1xqLgo2_",
      basedOnSchema: "dataset"
    };
    api.createDataset(createOptions, function(err, id) {
      expect(err).to.not.exist;
      done();
    });
  });
});

describe("delete", function() {
  it("deletes dataset", function(done) {
    api.deleteDataset("HygNQgNkZx", function(err, response) {
      console.log(err);
      expect(err).to.not.exist;
      done();
    });
  });
});


describe("distinct", function() {
  it("gets unique values of key", function(done) {
    api.distinct("datasets/SkxbDChh_/distinct", "year", null, null, null,  function(err, data) {
      expect(err).to.not.exist;
      expect(data).to.exist;
      done();
    });
  });
});