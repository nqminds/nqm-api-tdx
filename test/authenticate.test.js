const config = require("./test-config");
const utils = require("./test-utils");
let api;

beforeAll(async() => {
  api = await utils.getApi();
});

test("invalid token fails to authenticate", () => {
  return api.authenticate("IAMEVIL:letmein")
    .catch((err) => {
      return utils.parseTDXError(err);
    })
    .then((error) => {
      return expect(error).toMatchObject({code: 401, failure: {code: "UnauthorizedError"}});
    });
});

test("valid token authenticates", () => {
  return api.authenticate(config.credentials)
    .then((token) => {
      return expect(token).toBeTruthy();
    });
});

test("invalid secret fails to authenticate", () => {
  return api.authenticate(`${config.credentials}xxx`)
    .catch((err) => {
      return utils.parseTDXError(err);
    })
    .then((error) => {
      return expect(error).toMatchObject({code: 401, failure: {code: "UnauthorizedError"}});
    });
});

