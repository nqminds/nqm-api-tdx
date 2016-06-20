module.exports = (function() {
  "use strict";
  var Query = require("./lib/query");
  var Command = require("./lib/command");

  function API() {
    Query.call(this);
    Command.call(this);
  }

  return API;
}());