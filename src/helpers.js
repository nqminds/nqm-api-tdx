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

/**
 * Builds a Request object for the given command bound to the TDX command service.
 * @param  {string} command - the target TDX command, e.g. "resource/create"
 * @param  {object} data - the command payload
 * @param  {string} [contentType=application/json] - the content type
 * @param  {bool} [noSync=false] - send command asynchronously
 */
const buildCommandRequest = function(command, data, contentType, async) {
  const commandMode = async ? "command" : "commandSync";
  contentType = contentType || "application/json";
  return new Request(`${this.config.commandHost}/${commandMode}/${command}`, {
    method: "POST",
    mode: "cors",
    headers: new Headers({
      "Authorization": `Bearer ${this.accessToken}`,
      "Content-Type": contentType,
    }),
    body: JSON.stringify(data),
  });
}

/**
 * Builds a Request object for the given query bound to the TDX query engine.
 * @param  {string} endpoint - the query endpoint, e.g. "resources/DKJF8d8f"
 * @param  {object} [filter] - a filter expression, e.g. {"temperature": {$gt: 18}}
 * @param  {object} [projection] - a projection definition defining what data will be returned, e.g. {sensorId: 1, temperature: 1}
 * @param  {object} [options] - query options, e.g. {limit: 10, sort: {timestamp: -1}}
 */
const buildQueryRequest = function(endpoint, filter, projection, options) {
  filter = filter ? JSON.stringify(filter) : "";
  projection = projection ? JSON.stringify(projection) : "";
  options = options ? JSON.stringify(options) : "";
  let query;
  if (endpoint.indexOf("?") < 0) {
    // There is no query portion in the prefix - add one now.
    query = `${endpoint}?filter=${filter}&proj=${projection}&opts=${options}`;
  } else {
    // There is already a query portion, so append the params.
    query = `${endpoint}&filter=${filter}&proj=${projection}&opts=${options}`;
  }
  return new Request(`${this.config.queryHost}${query}`, {
    method: "GET",
    mode: "cors",
    headers: new Headers({
      "Authorization": `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    }),
  });
}

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
