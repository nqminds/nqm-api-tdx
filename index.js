module.exports = (function() {
  "use strict";

  // To enable debug.
  if (!process.env.DEBUG) {
    process.env.DEBUG = "nqm-*";
  }
  // Default output to STDOUT rather than STDERR.
  process.env.DEBUG_FD = 1;

  var API = require("./lib/api.js");
  return API;
}())