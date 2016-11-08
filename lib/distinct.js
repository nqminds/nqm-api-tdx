module.exports = (function() {
  "use strict";

  var sendRequest = require("./send-request");
  var util = require("util");

  var distinct = function(method, key, filter, projection, options, cb) {
    filter = filter ? JSON.stringify(filter) : "";
    projection = projection ? JSON.stringify(projection) : "";
    options = options ? JSON.stringify(options) : "";
    var distinctURL = util.format("%s?key=%s&filter=%s&proj=%s&opts=%s", method, key, filter, projection, options);
    return this._distinctGet(distinctURL, cb);
  };

  var getDistinct = function(datasetId, key, filter, projection, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = undefined;
    }
    if (typeof projection === "function") {
      cb = projection;
      projection = options = undefined;
    }
    if (typeof filter === "function") {
      cb = filter;
      filter = projection = options = undefined;
    }
    return distinct.call(this, "datasets/" + datasetId + "/distinct", key, filter, projection, options, cb);
  };
  
  function DistinctAPI(config) {
    this._version = config.version || "v1";
    this._distinctGet = sendRequest.get(config.queryHost + "/" + this._version);
    this.distinct = distinct;
    this.getDistinct = getDistinct;
  }

  return DistinctAPI;
}());