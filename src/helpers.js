import Promise from "bluebird";
import debug from "debug";

const checkResponse = function(response) {
  return response.json()
    .then((json) => {
      if (response.ok) {
        return Promise.resolve(json);
      } else {
        return Promise.reject(new Error(json.error || JSON.stringify(json)));
      }
    });
};

const setDefaults = function(config) {
  const log = debug("nqm-api-tdx:setDefaults");
  if (config.tdxHost && (!config.queryHost || !config.commandHost)) {
    const protocolComponents = config.tdxHost.split("://");
    if (protocolComponents.length !== 2) {
      throw new Error(`invalid tdxHost in config - no protocol: ${config.tdxHost}`);
    }
    const protocol = protocolComponents[0];
    const hostComponents = protocolComponents[1].split(".");
    if (hostComponents.length < 3) {
      throw new Error(`invalid tdxHost in config - expected sub.domain.tld: ${config.tdxHost}`);
    }
    const hostname = hostComponents.slice(1).join(".");
    config.commandHost = config.commandHost || `${protocol}://cmd.${hostname}`;
    config.queryHost = config.queryHost || `${protocol}://q.${hostname}`;
    config.databotHost = config.databotHost || `${protocol}://databot.${hostname}`;
    log(
      "defaulted hosts to %s, %s, %s",
      config.commandHost,
      config.queryHost,
      config.databotHost
    );
  }
};

export {
  checkResponse,
  setDefaults,
};
