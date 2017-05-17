import Promise from "bluebird";
import debug from "debug";

const TDXApiError = function(message, stack) {
  this.name = "TDXApiError";
  this.message = message || "no message given";
  this.stack = stack || (new Error()).stack;
};

TDXApiError.prototype = Object.create(Error.prototype);
TDXApiError.prototype.constructor = TDXApiError;

const handleError = function(source, err) {
  const code = typeof err.code === "undefined" ? "n/a" : err.code;
  const message = err.response ? (err.response.text || err.message) : err.message;
  const internal = {
    name: "TDXApiError",
    from: source,
    failure: message,
    stack: err.stack,
    code: code,
  };
  return new TDXApiError(JSON.stringify(internal), err.stack);
};

const checkResponse = function(source, response) {
  return response.json()
    .then((json) => {
      if (response.ok) {
        return Promise.resolve(json);
      } else {
        if (json.error) {
          // TODO  - test
          debugger; // eslint-disable-line no-debugger
          return Promise.reject(handleError(source, {message: json.error}));
        } else {
          return Promise.reject(handleError(source, json));
        }
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
  handleError,
  setDefaults,
  TDXApiError,
};
