import assert from "node:assert/strict";
import {
  before, mock, test,
} from "node:test";

const requests = [];
let respond;
mock.module("@pipedream/platform", {
  namedExports: {
    axios: async (_, config) => {
      requests.push(config);
      return respond(config);
    },
    ConfigurationError: class ConfigurationError extends Error {},
  },
});
let enrich;
let search;
let similar;
let client;
before(async () => {
  const { default: app } = await import("./companyenrich.app.mjs");
  ({ default: enrich } = await import("./actions/enrich-company/enrich-company.mjs"));
  ({ default: search } = await import("./actions/search-companies/search-companies.mjs"));
  ({ default: similar } = await import("./actions/find-similar-companies/find-similar-companies.mjs"));
  client = {
    ...app.methods,
    $auth: {
      api_key: "test-key",
    },
  };
});
const $ = {
  export: mock.fn(),
};

test("enrich uses bearer auth and domain query, returning the company", async () => {
  requests.length = 0;
  respond = () => ({
    id: "company-id",
    domain: "example.com",
  });
  assert.equal((await enrich.run.call({
    app: client,
    domain: "example.com",
  }, {
    $,
  })).id, "company-id");
  assert.equal(requests[0].url, "https://api.companyenrich.com/companies/enrich");
  assert.equal(requests[0].headers.Authorization, "Bearer test-key");
  assert.deepEqual(requests[0].params, {
    domain: "example.com",
  });
});

test("search preserves filters, paginates without gaps or paid overfetch", async () => {
  requests.length = 0;
  respond = ({ data }) => ({
    items: Array.from({
      length: data.pageSize,
    }, (_, index) => ({
      id: (data.page - 1) * data.pageSize + index,
    })),
    totalPages: Math.ceil(1000 / data.pageSize),
  });
  const companies = await search.run.call({
    app: client,
    query: "Acme",
    countries: [
      "US",
    ],
    maxResults: 103,
  }, {
    $,
  });
  assert.deepEqual(companies.map(({ id }) => id), Array.from({
    length: 103,
  }, (_, index) => index));
  assert.equal(requests.reduce((sum, { data }) => sum + data.pageSize, 0), 103);
  assert.equal(requests.length, 3);
  assert.ok(requests.every(({ data }) => data.query === "Acme" && data.countries[0] === "US"));
});

test("similar uses domains, stops on an empty page and validates seed count", async () => {
  requests.length = 0;
  respond = () => ({
    items: [],
    totalPages: 0,
  });
  assert.deepEqual(await similar.run.call({
    app: client,
    domains: [
      "example.com",
    ],
  }, {
    $,
  }), []);
  assert.deepEqual(requests[0].data.domains, [
    "example.com",
  ]);
  assert.equal(requests[0].url, "https://api.companyenrich.com/companies/similar");
  await assert.rejects(similar.run.call({
    app: client,
    domains: [],
  }, {
    $,
  }), /one and ten/);
  await assert.rejects(client.searchCompanies({
    $,
    maxResults: 0,
  }), /Max Results/);
});

test("API failures propagate without retrying or exporting success", async () => {
  requests.length = 0;
  respond = () => { throw new Error("HTTP 402"); };
  const exportsBefore = $.export.mock.callCount();
  await assert.rejects(enrich.run.call({
    app: client,
    domain: "example.com",
  }, {
    $,
  }), /HTTP 402/);
  assert.equal(requests.length, 1);
  assert.equal($.export.mock.callCount(), exportsBefore);
});
