import debug from "debug";

const TDXApiError = function(message, stack) {
  this.name = "TDXApiError";
  this.message = message || "no message given";
  this.stack = stack || (new Error()).stack;
};

TDXApiError.prototype = Object.create(Error.prototype);
TDXApiError.prototype.constructor = TDXApiError;

const handleError = function(source, failure, code) {
  const internal = {
    from: source,
    failure: JSON.stringify(failure),
    code: typeof code === "undefined" ? "n/a" : code,
  };
  return new TDXApiError(JSON.stringify(internal), (new Error()).stack);
};

const checkResponse = function(source, response) {
  return response.json()
    .then((json) => {
      if (response.ok) {
        return Promise.resolve(json);
      } else {
        if (json.error) {
          // Build a failure object from the json response.
          const failure = {code: json.error, message: json.error_description};
          return Promise.reject(handleError(source, failure, response.status));
        } else {
          // The response body holds the error details.
          return Promise.reject(handleError(source, json, response.status));
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
    config.queryHost = config.queryHost || `${protocol}://q.${hostname}/v1/`;
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
