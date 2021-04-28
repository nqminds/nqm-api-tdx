/* eslint-disable no-underscore-dangle */
const utils = require("./test-utils");
const constants = require("@nqminds/nqm-core-utils").constants;
const resourceId = utils.testId("deleteData");
const derivedId = `${resourceId}_derived`;
let api;

beforeAll(async() => {
  // Initialise the api.
  api = await utils.getApi();

  // Create the test dataset.
  return utils.addResource(
    api,
    {
      id: resourceId,
      name: "addData dataset",
      basedOnSchema: constants.datasetResourceType,
      schema: {
        dataSchema: {
          id: "string",
          value: "number",
        },
        uniqueIndex: {id: 1},
      },
    }
  ).then(() => {
    // Create a derived dataset.
    const readFilter = {id: {$ne: "xyz"}};
    const writeFilter = {value: {$gt: 99}};
    return utils.addResource(
      api,
      {
        id: derivedId,
        name: "addData derived dataset",
        derived: {
          source: resourceId,
          filter: JSON.stringify(readFilter),
          readOnly: false,
          writeFilter: JSON.stringify(writeFilter),
        },
      },
    );
  });
}, 30000); // slow setup

afterAll(async() => {
  if (!api) {
    return;
  }
  // Delete the test dataset.
  return api.deleteResource(resourceId)
    .catch(() => {})
    .then(() => {
      // Delete the derived dataset.
      return api.deleteResource(derivedId);
    })
    .catch(() => {});
});

test("adds a document", async() => {
  const addResult = api.addData(resourceId, {id: "xyz", value: 123});
  await expect(addResult).resolves.toEqual(expect.objectContaining({response: {id: "xyz"}}));
});

test("fails to add a duplicate document", async() => {
  const result = api.addData(resourceId, {id: "xyz", value: 999});
  await expect(result).rejects.toEqual(expect.objectContaining({code: 400}));
});

test("adds a document to derived", async() => {
  const addResult = api.addData(derivedId, {id: "123", value: 100});
  await expect(addResult).resolves.toEqual(expect.objectContaining({response: {id: "123"}}));
});

test("fails to add to derived breaking constraint", async() => {
  const result = api.addData(derivedId, {id: "234", value: 1});
  await expect(result).rejects.toEqual(expect.objectContaining({code: 400}));
});

