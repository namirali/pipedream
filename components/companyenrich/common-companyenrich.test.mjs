import assert from "node:assert/strict";
import {
  after, before, mock, test,
} from "node:test";
import { readFileSync } from "node:fs";

const originalFetch = globalThis.fetch;
const requests = [];
let respond;
let client;
const actions = {};
const exports = [];
const $ = {
  export: (key, value) => exports.push([
    key,
    value,
  ]),
};
const fixtures = JSON.parse(readFileSync(new URL("./common/fixtures.json", import.meta.url)));
before(async () => {
  const { default: app } = await import("./companyenrich.app.mjs");
  client = {
    ...app.methods,
    $auth: {
      api_key: "test-secret",
    },
  };
  for (const slug of [
    "enrich-company",
    "search-companies",
    "find-similar-companies",
    "search-people",
    "lookup-person",
    "get-workforce",
    "enrich-by-properties",
    "batch-enrich-companies",
    "get-company",
    "get-person",
    "count-companies",
    "count-similar-companies",
    "advanced-request",
  ]) {
    actions[slug] = (await import(`./actions/${slug}/${slug}.mjs`)).default;
  }
  globalThis.fetch = mock.fn(async (url, init) => {
    requests.push({
      url,
      ...init,
    });
    return respond(url, init);
  });
});
after(() => { globalThis.fetch = originalFetch; });
function success(value) { return new Response(JSON.stringify(value), {
  status: 200,
}); }
async function run(name, params) {
  return actions[name].run.call({
    app: client,
    ...params,
  }, {
    $,
  });
}
for (const fixture of fixtures) {
  test(`advanced ${fixture.operation} uses its documented wire contract and preserves result`, async () => {
    requests.length = 0;
    respond = () => success(fixture.response);
    assert.deepEqual(await run("advanced-request", fixture), fixture.response);
    assert.equal(requests.length, 1);
    const request = requests[0];
    const url = new URL(request.url);
    let expectedPath = fixture.path;
    for (const [
      key,
      value,
    ] of Object.entries(fixture.path_parameters)) expectedPath = expectedPath.replace(`{${key}}`, encodeURIComponent(value));
    assert.equal(url.origin, "https://api.companyenrich.com");
    assert.equal(url.pathname, expectedPath);
    assert.equal(request.method, fixture.method);
    assert.equal(request.headers.Authorization, "Bearer test-secret");
    assert.equal(request.redirect, "error");
    for (const [
      key,
      value,
    ] of Object.entries(fixture.query)) assert.equal(url.searchParams.get(key), value);
    if (fixture.operation === "post_people_email_bulk") assert.match(request.body, /"person_id":9223372036854775807/);
  });
}

test("all twelve native actions invoke the route through their public run handler", async () => {
  const cases = [
    [
      "enrich-company",
      {
        domain: "example.com",
      },
      "GET",
      "/companies/enrich",
    ],
    [
      "search-companies",
      {
        query: "Example",
      },
      "POST",
      "/companies/search",
    ],
    [
      "find-similar-companies",
      {
        domains: [
          "example.com",
        ],
      },
      "POST",
      "/companies/similar",
    ],
    [
      "search-people",
      {
        filters: {
          domains: [
            "example.com",
          ],
        },
      },
      "POST",
      "/people/search",
    ],
    [
      "lookup-person",
      {
        email: "test@example.com",
      },
      "POST",
      "/people/lookup",
    ],
    [
      "get-workforce",
      {
        domain: "example.com",
      },
      "GET",
      "/companies/workforce",
    ],
    [
      "enrich-by-properties",
      {
        properties: {
          name: "Example",
        },
      },
      "POST",
      "/companies/enrich",
    ],
    [
      "batch-enrich-companies",
      {
        domains: [
          "example.com",
        ],
      },
      "POST",
      "/companies/enrich/batch",
    ],
    [
      "get-company",
      {
        id: "00000000-0000-4000-8000-000000000001",
      },
      "GET",
      "/companies",
    ],
    [
      "get-person",
      {
        id: "9223372036854775807",
      },
      "GET",
      "/people",
    ],
    [
      "count-companies",
      {
        query: "Example",
      },
      "POST",
      "/companies/search/count",
    ],
    [
      "count-similar-companies",
      {
        domains: [
          "example.com",
        ],
      },
      "POST",
      "/companies/similar/count",
    ],
  ];
  for (const [
    name,
    params,
    method,
    path,
  ] of cases) {
    requests.length = 0;
    respond = () => success({
      items: [],
      totalPages: 0,
    });
    await run(name, params);
    assert.equal(requests.length, 1, name);
    assert.equal(new URL(requests[0].url).pathname, path, name);
    assert.equal(requests[0].method, method, name);
  }
});

test("structured filters and expansions survive, dedicated inputs win, full pages export with legacy array", async () => {
  requests.length = 0;
  exports.length = 0;
  const company = {
    id: "a",
    location: {
      city: "Paris",
    },
    future: [
      null,
      0,
    ],
  };
  const page = {
    items: [
      company,
    ],
    page: 1,
    totalPages: 1,
    totalItems: 1,
    metadata: {
      scores: {
        a: 0.8,
      },
    },
    future: "kept",
  };
  respond = () => success(page);
  const result = await run("search-companies", {
    query: "Dedicated",
    semanticQuery: "Developer tools",
    filters: {
      query: "Old",
      technologies: [
        "Node.js",
      ],
      futureFilter: {
        nested: true,
      },
    },
    expand: [
      "workforce",
    ],
  });
  assert.deepEqual(result, [
    company,
  ]);
  assert.deepEqual(exports.find(([
    key,
  ]) => key === "pages")[1], [
    page,
  ]);
  const body = JSON.parse(requests[0].body);
  assert.equal(body.query, "Dedicated");
  assert.equal(body.semanticQuery, "Developer tools");
  assert.deepEqual(body.technologies, [
    "Node.js",
  ]);
  assert.deepEqual(body.futureFilter, {
    nested: true,
  });
  assert.equal(new URL(requests[0].url).searchParams.get("expand"), "workforce");
});

test("legacy pagination avoids gaps and paid overfetch; default stays a single ten-result page", async () => {
  requests.length = 0;
  respond = (_, init) => {
    const data = JSON.parse(init.body);
    return success({
      items: Array.from({
        length: data.pageSize,
      }, (_, i) => ({
        id: (data.page - 1) * data.pageSize + i,
      })),
      totalPages: Math.ceil(1000 / data.pageSize),
    });
  };
  const result = await run("search-companies", {
    maxResults: 103,
  });
  assert.deepEqual(result.map(({ id }) => id), Array.from({
    length: 103,
  }, (_, i) => i));
  assert.equal(requests.reduce((sum, request) => sum + JSON.parse(request.body).pageSize, 0), 103);
  requests.length = 0;
  assert.equal((await run("search-companies", {})).length, 10);
  assert.equal(requests.length, 1);
});

test("zero count, batch arrays, and large decimal person IDs survive unchanged", async () => {
  requests.length = 0;
  respond = () => success(0);
  assert.equal(await run("count-companies", {}), 0);
  const batch = [
    {
      id: "a",
      future: {
        value: false,
      },
    },
    {
      domain: "missing.com",
      error: "not found",
    },
  ];
  respond = () => success(batch);
  assert.deepEqual(await run("batch-enrich-companies", {
    domains: [
      "example.com",
      "missing.com",
    ],
  }), batch);
  respond = () => success({
    id: "9223372036854775807",
  });
  await run("get-person", {
    id: "9223372036854775807",
  });
  assert.equal(new URL(requests.at(-1).url).searchParams.get("id"), "9223372036854775807");
});

test("invalid inputs, hidden endpoints, unsafe paths and beta operations spend no requests", async () => {
  const invalid = [
    {
      operation: "get_me",
    },
    {
      operation: "constructor",
    },
    {
      operation: "get_companies_enrich",
      query: {
        domain: "",
      },
    },
    {
      operation: "get_companies_enrich",
      query: {
        domain: "example.com",
        url: "https://evil.invalid",
      },
    },
    {
      operation: "get_companies_enrich",
      query: {
        domain: "example.com",
        waitForEnrichment: "true",
      },
    },
    {
      operation: "get_companies_workforce",
      query: {},
    },
    {
      operation: "get_companies_workforce",
      query: {
        id: "00000000-0000-4000-8000-000000000001",
        domain: "example.com",
      },
    },
    {
      operation: "post_companies_enrich",
      body: {},
    },
    {
      operation: "post_companies_enrich_batch",
      body: {
        domains: [],
      },
    },
    {
      operation: "post_companies_enrich_batch",
      body: {
        domains: Array(51).fill("example.com"),
      },
    },
    {
      operation: "post_companies_similar_count",
      body: {
        domains: Array(11).fill("example.com"),
      },
    },
    {
      operation: "post_companies_search",
      body: {
        page: true,
      },
    },
    {
      operation: "post_companies_search",
      body: {
        page: 101,
        pageSize: 100,
      },
    },
    {
      operation: "post_companies_search",
      body: {
        future: {
          value: NaN,
        },
      },
    },
    {
      operation: "post_companies_search",
      body: {
        query: "x".repeat(251),
      },
    },
    {
      operation: "post_companies_search",
      body: {
        semanticQuery: "x".repeat(501),
      },
    },
    {
      operation: "post_people_lookup",
      body: {
        email: "",
      },
    },
    {
      operation: "get_people",
      query: {
        id: Number("9223372036854775807"),
      },
    },
    {
      operation: "get_people",
      query: {
        id: "9223372036854775808",
      },
    },
    {
      operation: "get_people_email",
      query: {
        id: "1",
      },
    },
    {
      operation: "get_geo_countries_countrycode",
      path_parameters: {
        countryCode: "..",
      },
    },
    {
      operation: "post_companies_search_async",
      body: {},
    },
    {
      operation: "post_people_search_async",
      body: {
        count: 50001,
      },
    },
    {
      operation: "post_people_email_bulk",
      body: {
        items: [],
      },
      allow_beta: true,
    },
    {
      operation: "post_companies_search",
      body: [],
    },
  ];
  for (const input of invalid) {
    requests.length = 0;
    await assert.rejects(run("advanced-request", input));
    assert.equal(requests.length, 0, JSON.stringify(input));
  }
});

test("API and transport failures stay sanitized and do not retry or export provider data", async () => {
  for (const failure of [
    () => new Response("{\"secret\":\"test-secret\",\"message\":\"private account\"}", {
      status: 429,
    }),
    () => { throw new Error("test-secret private transport info"); },
  ]) {
    requests.length = 0;
    exports.length = 0;
    respond = failure;
    await assert.rejects(run("enrich-company", {
      domain: "example.com",
    }), (error) => !error.message.includes("test-secret") && !error.message.includes("private"));
    assert.equal(requests.length, 1);
    assert.deepEqual(exports, []);
  }
});

test("advanced preserves unknown metadata strings and rejects malformed export seeds", async () => {
  requests.length = 0;
  respond = () => success({
    status: "pending",
    url: "https://example.com/result",
  });
  await run("advanced-request", {
    operation: "post_people_email_bulk",
    allow_beta: true,
    body: {
      items: [
        {
          person_id: "9223372036854775807",
          future: {
            person_id: "123",
          },
        },
      ],
      metadata: {
        person_id: "456",
      },
    },
  });
  assert.match(requests[0].body, /"person_id":9223372036854775807/);
  assert.match(requests[0].body, /"future":\{"person_id":"123"\}/);
  assert.match(requests[0].body, /"metadata":\{"person_id":"456"\}/);
  assert.equal(requests.length, 1);
  for (const similar of [
    {},
    {
      domains: [
        "",
      ],
    },
    {
      domains: Array(11).fill("a.com"),
    },
  ]) {
    requests.length = 0;
    await assert.rejects(run("advanced-request", {
      operation: "post_companies_search_async",
      body: {
        count: 1,
        similar,
      },
    }));
    assert.equal(requests.length, 0);
  }
  await assert.rejects(run("advanced-request", {
    operation: "post_companies_search",
    body: {
      future: Array(1),
    },
  }));
});
