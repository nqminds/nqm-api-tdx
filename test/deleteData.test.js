/* eslint-disable no-underscore-dangle */
const utils = require("./test-utils");
const constants = require("@nqminds/nqm-core-utils").constants;
const resourceId = utils.testId("deleteData");
let api;

beforeAll(async() => {
  // Initialise the api.
  api = await utils.getApi();

  // Create the test dataset.
  return utils.addResource(
    api,
    {
      id: resourceId,
      name: "deleteData dataset",
      basedOnSchema: constants.datasetResourceType,
      schema: {
        dataSchema: {
          id: "string",
          value: "string",
        },
        uniqueIndex: {id: 1},
      },
    }
  );
}, 20000);

afterAll(async() => {
  // Delete the test datsaet.
  return api.deleteResource(resourceId).catch(() => {});
});

test("deletes a document", async() => {
  const addResult = api.addData(resourceId, {id: "xyz", value: "foo bar"});
  await expect(addResult).resolves.toEqual(expect.objectContaining({response: {id: "xyz"}}));
  const deleteResult = api.deleteData(resourceId, {id: "xyz"});
  await expect(deleteResult).resolves.toEqual(expect.objectContaining({response: {id: "xyz"}}));
});

test("fails to delete a non-existent document", async() => {
  const result = api.deleteData(resourceId, {id: "abc"});
  await expect(result).rejects.toEqual(expect.objectContaining({code: 400}));
});

