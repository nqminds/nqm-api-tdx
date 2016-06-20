module.exports = (function() {
  "use strict";

  return {
    Query: require("./lib/query.js"),
    Command: require("./lib/command.js")
  };
}())