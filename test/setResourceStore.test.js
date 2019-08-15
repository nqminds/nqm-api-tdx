const utils = require("./test-utils");
const resourceId = utils.testId("setResourceStore");
let api;

beforeAll(async() => {
  api = await utils.getApi();
  // Delete and re-create the test dataset.
  return api.deleteResource(resourceId)
    .catch(() => {})
    .then(() => {
      return utils.addResource(
        api,
        {
          id: resourceId,
          name: "setResourceStore",
          basedOnSchema: utils.constants.rawFileResourceType,
        }
      );
    });
});

test("sets resource store", async() => {
  const result = await api.setResourceStore(resourceId, "-some-random-");
  expect(result).toMatchObject({response: {id: expect.any(String)}});
});

test("sets resource store and size", async() => {
  const result = await api.setResourceStore(resourceId, "-more-random-", 9999);
  expect(result).toMatchObject({response: {id: expect.any(String)}});
  const resource = await api.getResource(resourceId);
  expect(resource.store).toEqual("-more-random-");
  expect(resource.storeSize).toEqual(9999);
});

test("sets resource store only", async() => {
  const result = await api.setResourceStore(resourceId, "-another-random-");
  expect(result).toMatchObject({response: {id: expect.any(String)}});
  const resource = await api.getResource(resourceId);
  expect(resource.store).toEqual("-another-random-");
  expect(resource.storeSize).toEqual(9999);
});
