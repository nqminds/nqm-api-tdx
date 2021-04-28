module.exports = (function () {
  const configs = {
    localConfig: {
      tdxConfig: {
        commandServer: "http://localhost:3103",
        queryServer: "http://localhost:3104",
      },
      credentials: "S1xKBBDm1r:password",
    },
  };

  return configs.localConfig;
})();
