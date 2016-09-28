module.exports = (function() {
  "use strict";
  
  var sendRequest = require("./send-request");
  var util = require("util");

  var aggregate = function(method, pipeline, options, cb) {
    options = options ? JSON.stringify(options) : "";
    var aggregateURL = util.format("%s?pipeline=%s&options=%s", method, pipeline, options);
    return this._aggregateGet(aggregateURL, cb);
  };

  var getAggregateData = function(datasetId, pipeline, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = undefined;
    }
    return aggregate.call(this, "datasets/" + datasetId + "/aggregate", pipeline, options, cb);
  };

  function AggregateAPI(config) {
    this._version = config.version || "v1";
    this._aggregateGet = sendRequest.get(config.queryHost + "/" + this._version);
    this.aggregate = aggregate;
    this.getAggregateData = getAggregateData;
  }

  return AggregateAPI;
}());