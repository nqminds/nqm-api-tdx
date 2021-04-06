import TDXApi from "./api-tdx"
/* allows us to do:
 *     const TDXApi = require("")
 * instead of:
 *     const TDXApi = require("").default;
 */
export = TDXApi;
