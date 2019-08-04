module.exports = (function() {
  const configs = {
    localConfig: {
      tdxConfig: {
        commandServer: "http://localhost:3103",
        queryServer: "http://localhost:3104",
      },
      credentials: "S1xKBBDm1r:password",
    },
    nqm1Config: {
      tdxConfig: {
        tdxServer: "http://tdx.nqm-1.com",
      },
      credentials: "HyxyK0ACMH:password",
    },
  };

  return configs.nqm1Config;
}());
