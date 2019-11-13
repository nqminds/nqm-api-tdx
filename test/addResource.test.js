const utils = require("./test-utils");
const constants = require("@nqminds/nqm-core-utils").constants;
const resourceId = utils.testId("addResource");
let api;

beforeAll(async() => {
  api = await utils.getApi();
});

beforeEach(async() => {
  // Make sure the test dataset doesn't already exist.
  return api.deleteResource(resourceId).catch(() => {}).then(utils.delay);
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
}, 10000);

test("fails to create duplicate dataset resource", async() => {
  await utils.addResource(
    api,
    {
      id: resourceId,
      name: "addResource dataset",
      basedOnSchema: constants.datasetResourceType,
    }
  );
  const addResult = api.addResource({
    id: resourceId,
    name: "addResource dataset",
    basedOnSchema: constants.datasetResourceType,
  }, true);
  await expect(addResult).rejects.toBeTruthy();
}, 10000);

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
}, 10000);
