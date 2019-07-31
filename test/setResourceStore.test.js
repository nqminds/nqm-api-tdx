const utils = require("./test-utils");
const resourceId = utils.testId("setResourceStore");
let api;

beforeAll(async() => {
  api = await utils.getApi();
});

beforeEach(async() => {
  // Delete and re-create the test dataset.
  return api.deleteResource(resourceId)
    .catch(() => {})
    .then(() => {
      return utils.addResource(
        api,
        {
          id: resourceId,
          name: "setResourceStore",
          basedOnSchema: utils.constants.datasetResourceType,
        }
      );
    });
});

test("sets resource store", async() => {
  const result = await api.setResourceStore(resourceId, "-some-random-");
  expect(result).toMatchObject({response: {id: expect.any(String)}});
});
