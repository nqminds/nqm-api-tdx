const utils = require("./test-utils");
const constants = require("@nqminds/nqm-core-utils").constants;
const resourceId = utils.testId("addResource");
let api;

beforeAll(async() => {
  api = await utils.getApi();
});

beforeEach(async() => {
  // Make sure the test dataset doesn't already exist.
  return api.deleteResource(resourceId).catch(() => {});
});

test("creates dataset resource", async() => {
  return utils.addResource(
    api,
    {
      id: resourceId,
      name: "addResource dataset",
      basedOnSchema: constants.datasetResourceType,
    }
  );
});

test("creates text content resource", async() => {
  return utils.addResource(
    api,
    {
      id: resourceId,
      name: "addResource text content",
      basedOnSchema: "application-json",
      textContent: {foo: "bar"},
    }
  );
});
