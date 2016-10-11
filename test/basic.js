var chai = require("chai");
var expect = chai.expect;

var APIModule = require("../lib/api.js");
var testConfig = {
  commandHost: "https://cmd.nqminds.com",
  queryHost: "https://q.nqminds.com"
};
var api = new APIModule(testConfig);

describe("authenticate", function() {
  it("fails to authenticate invalid credentials", function(done) {
    api.authenticate("foo","bar",function(err, token) {
      expect(token).to.not.exist;
      expect(err).to.exist;
      done();
    });
  });
  it("authenticates valid credentials", function(done) {
    api.authenticate("Skgsbgond","password",function(err, token) {
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
      console.log(contents.toString());
      var data = JSON.parse(contents);
      expect(data.data.length).to.equal(1000);
      done();
    });
    request.on("error", function(err) {
      expect(err).to.not.exist;
    });
  })
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


describe("distinct", function() {
  it("gets unique values of key", function(done) {
    api.distinct("datasets/SkxbDChh_/distinct", "year", null, null, null,  function(err, data) {
      expect(err).to.not.exist;
      expect(data).to.exist;
      done();
    });
  });
});