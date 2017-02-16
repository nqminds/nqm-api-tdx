module.exports = (function() {
  "use strict";

  var log = require("debug")("nqm-api-tdx:account");
  var sendRequest = require("./send-request");

  var createEmailAccount = function(emailAddress, verified, approved, displayName, cb) {
    if (typeof displayName === "function") {
      cb = displayName;
      displayName = undefined;
    }
    log("createEmailAccount");
    var postData = {
      username: emailAddress,
      accountType: "user",    // user-based account (not a share key)
      authService: "local",   // email-based account (not oauth)
      verified: verified,
      approved: approved,
      displayName: displayName,
    };
    return this.commandPost.call(this, "account/create", postData, cb);
  };

  var deleteAccount = function(username, cb) {
    log("deleteAccount");
    var postData = {
      username: username,
    };
    return this.commandPost.call(this, "account/delete", postData, cb);
  };

  function AccountAPI(config) {
    this.commandPost = sendRequest.post(config.commandHost + "/commandSync");
    this.createEmailAccount = createEmailAccount;
    this.deleteAccount = deleteAccount;
  }

  return AccountAPI;
}());
