/**
 * The TDX api supplies detailed error information depending on the context of the call.
 * In some instances, e.g. attempting to retrieve a resource that does not exist, the
 * error will be a simple `NotFound` string message. In other cases, e.g. attempting
 * to update 100 documents in a single call, the error will supply details for each
 * document update that failed, such as the primary key of the document and the reason
 * for the failure.
 * @example
 * <caption>`failure` for simple query error</caption>
 * const failure = {
 *   code: "NotFound",
 *   message: "resource not found: KDiEI3k_"
 * };
 * @example
 * <caption>`failure` for complex data update error</caption>
 * const failure = {
 *  code: "BadRequestError",
 *  message: [
 *    {
 *      key: {id: "foo"},
 *      error: {
 *        message: "document not found matching key 'foo'"
 *      }
 *    },
 *    {
 *      key: {id: "bar"},
 *      error: {
 *        message: "'hello' is not a valid enum value",
 *        name: "ValidatorError",
 *        kind: "enum"
 *        path: "value"
 *      }
 *    }
 *  ]
 * };
 */
class TDXApiError extends Error {
  constructor(code, failure, source, stack) {
    // Build a string summary for legacy or non-json clients.
    const stringVersion = JSON.stringify({
      from: source,
      failure: JSON.stringify(failure),
      code,
    });

    super();
    /**
     * `"TDXApiError"`, indicating the error originated from this library.
     * @type {string}
     */
    this.name = "TDXApiError";
    /**
     * The HTTP response status code, e.g. 401.
     * @type {number}
     */
    this.code = code;
    /**
     * A string-encoded form of the error, essentially a JSON stringified
     * copy of the entire error object.
     * @deprecated This is included for legacy reasons and may be removed in a future release.
     * @type {string}
     */
    this.message = stringVersion;
    /**
     * Usually the name of the API call that originated the error, e.g. updateData
     * @type {string}
     */
    this.from = source;

    /**
     * @typedef {object} FailureObject - Error information as received from the TDX
     * @property {string} code - the TDX short error code, e.g. NotFound, PermissionDenied etc.
     * @property {string|array} message - details of the failure. For simple cases this will be a string,
     * e.g. `resource not found: KDiEI3k_`. In other instances this will be an array of objects describing each error.
     * See the example below showing a failed attempt to update 2 documents.
     * One of the errors is a simple document not found and the other is a validation error giving details of the
     * exact path in the document that failed validation.
     */

    /**
     * An object containing the error information as received from the TDX
     * @type {FailureObject}
     */
    this.failure = failure;
    /**
     * The stack trace
     * @type {string}
     */
    this.stack = stack || new Error(this.message).stack;
  }
}

export default TDXApiError;
