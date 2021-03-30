/* eslint-disable no-underscore-dangle */
const utils = require("./test-utils");
const constants = require("@nqminds/nqm-core-utils").constants;
const resourceId = utils.testId("updateData");
const _ = require("lodash");

let api;

beforeAll(async() => {
  // Initialise the api.
  api = await utils.getApi();

  // Create the test dataset.
  return utils.addResource(
    api,
    {
      id: resourceId,
      name: "updateData dataset",
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
}, 30000); // slow setup

afterAll(async() => {
  if (!api) {
    return;
  }
  // Delete the test datsaet.
  return api.deleteResource(resourceId).catch(() => {});
});

afterEach(async() => {
  if (!api) {
    return;
  }
  await api.truncateResource(resourceId).then(() => utils.delay(2500));
});

test("upserts a new document", async() => {
  const result = await api.updateData(resourceId, {id: "xyz", value: "foo bar"}, true);
  expect(result.response.id).toEqual("xyz");
});

test("updates an existing document", async() => {
  await api.updateData(resourceId, {id: "xyz", value: "foo bar"}, true);
  const result = await api.updateData(resourceId, {id: "xyz", value: "hello world"});
  expect(result.response.id).toEqual("xyz");
});

test("updates a single document 100 times consecutively", async() => {
  expect.assertions(3);

  for (let i = 0; i < 100; i++) {
    await api.updateData(resourceId, {id: "xyz", value: `hello ${i}`}, true);
  }

  // Wait for projections to catch up.
  await utils.delay(1000);

  // Only expect one document.
  const countResult = await api.getDataCount(resourceId);
  expect(countResult.count).toEqual(1);

  // Expect 100 versions.
  const getResult = await api.getData(resourceId);
  expect(getResult.data[0].__version).toEqual(100);
  expect(getResult.data[0].value).toEqual("hello 99");
}, 60000);

test("updates a single document 100 times concurrently", async() => {
  // n.b. the requests won't necessarily arrive at the TDX in order - see
  // https://stackoverflow.com/questions/16288102/is-it-possible-to-receive-out-of-order-responses-with-http
  // Hence we can't determine what the final value of the document after the updates will be.
  for (let i = 0; i < 100; i++) {
    api.updateData(resourceId, {id: "xyz", value: `hello ${i}`}, true)
      .then(() => {
        // Uncomment this to see requests being sent out of order.
        // console.log("sent %d", i);
      });
  }
  await utils.delay(10000);
  const countResult = await api.getDataCount(resourceId);
  expect(countResult.count).toEqual(1);

  // Expect 100 versions.
  const getResult = await api.getData(resourceId);
  expect(getResult.data[0].__version).toEqual(100);
}, 120000);

test("upserts 1000 documents one at a time", async() => {
  for (let i = 0; i < 1000; i++) {
    await api.updateData(resourceId, {id: `doc-${i}`, value: `hello ${i}`}, true);
  }

  // Wait for projections to catch up.
  await utils.delay(5000);

  // Expect 1000 documents.
  const countResult = await api.getDataCount(resourceId);
  expect(countResult.count).toEqual(1000);

  // Expect 100 versions.
  const getResult = await api.getData(resourceId, {id: "doc-999"});
  expect(getResult.data[0].__version).toEqual(1);
  expect(getResult.data[0].value).toEqual("hello 999");
}, 300000);

test("upserts 1000 documents in 5 chunks", async() => {
  const docs = [];
  for (let i = 0; i < 1000; i++) {
    docs.push({id: `doc-${i}`, value: `hello ${i}`});
  }

  const chunks = _.chunk(docs, 200);
  for (let chunk = 0; chunk < chunks.length; chunk++) {
    await api.updateData(resourceId, chunks[chunk], true);
  }

  // Wait for projections to catch up.
  await utils.delay(2500);

  // Expect 1000 documents.
  const countResult = await api.getDataCount(resourceId);
  expect(countResult.count).toEqual(1000);

  // Expect 102 versions (initial create + first update + 100 updates).
  const getResult = await api.getData(resourceId, {id: "doc-999"});
  expect(getResult.data[0].__version).toEqual(1);
  expect(getResult.data[0].value).toEqual("hello 999");
}, 120000);

