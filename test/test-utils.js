module.exports = (function() {
  "use strict";
  // jest will automatically run this code through babel
  const TDXApi = require("../src/api-tdx");

  const config = require("./test-config");
  const nqmUtils = require("@nqminds/nqm-core-utils");

  const testId = function(id) {
    return `__test_${id}_test__`;
  };

  /**
   * Helper function for add resource tests.
   * @param {*} name - the name of the test
   * @param {*} options - the options to use when creating the resource.
   */
  const addResource = async(api, options) => {
    const addResult = await api.addResource(options, true);
    expect(addResult.response.id).toEqual(options.id);
    return addResult;
  };

  const delay = function(interval = 1000) {
    return new Promise((resolve) => {
      setTimeout(resolve, interval);
    });
  };

  const getApi = async function() {
    const api = new TDXApi(config.tdxConfig);
    await expect(api.authenticate(config.credentials)).resolves.toEqual(expect.any(String));
    return api;
  };

  const parseTDXError = function(error) {
    let parsed;
    try {
      parsed = JSON.parse(error.message);
      if (parsed.failure) {
        parsed.failure = JSON.parse(parsed.failure);
      }
    } catch (err) {
      parsed = error;
    }
    return parsed;
  };

  return {
    addResource,
    constants: nqmUtils.constants,
    delay,
    getApi,
    parseTDXError,
    testId,
  };
}());
