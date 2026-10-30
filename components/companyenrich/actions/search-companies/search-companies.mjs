import app from "../../companyenrich.app.mjs";

export default {
  key: "companyenrich-search-companies",
  name: "Search Companies",
  description: "Find companies by name, domain, countries, or keywords. Costs 1 credit per company returned, with a 1-credit minimum per request. [See the documentation](https://docs.companyenrich.com/reference/post_companies-search)",
  version: "0.0.1",
  type: "action",
  ai: "optimized",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: true,
  },
  props: {
    app,
    query: {
      type: "string",
      label: "Query",
      description: "Search company names and domains, for example `Acme`.",
      optional: true,
    },
    countries: {
      propDefinition: [
        app,
        "countries",
      ],
    },
    keywords: {
      propDefinition: [
        app,
        "keywords",
      ],
    },
    maxResults: {
      propDefinition: [
        app,
        "maxResults",
      ],
    },
  },
  async run({ $ }) {
    const companies = await this.app.searchCompanies({
      $,
      data: {
        query: this.query,
        countries: this.countries,
        keywords: this.keywords,
      },
      maxResults: this.maxResults,
    });
    $.export("$summary", `Found ${companies.length} companies`);
    return companies;
  },
};
