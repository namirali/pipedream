import app from "../../companyenrich.app.mjs";
import { mergeDefined } from "../../common/dispatcher.mjs";

export default {
  key: "companyenrich-search-companies",
  name: "Search Companies",
  description: "Search Companies with CompanyEnrich. Data requests can consume credits. [See the documentation](https://docs.companyenrich.com/reference/post_companies-search)",
  version: "0.0.2",
  type: "action",
  ai: "optimized",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: true,
  },
  props: {
    app,
    "query": {
      "type": "string",
      "label": "Query",
      "description": "Literal company name/domain query (up to 250 characters).",
      "optional": true,
    },
    "semanticQuery": {
      "type": "string",
      "label": "Semantic Query",
      "description": "Natural-language company description (up to 500 characters).",
      "optional": true,
    },
    "countries": {
      "propDefinition": [
        app,
        "countries",
      ],
    },
    "keywords": {
      "propDefinition": [
        app,
        "keywords",
      ],
    },
    "filters": {
      "type": "object",
      "label": "Filters",
      "description": "Documented API body fields, including nested filters. Explicit action inputs take precedence. See the API reference.",
      "optional": true,
    },
    "expand": {
      "type": "string[]",
      "label": "Expand",
      "description": "Optional workforce (company operations) or education (people operations) expansion. Workforce expansion can spend extra credits.",
      "optional": true,
    },
    "maxResults": {
      "propDefinition": [
        app,
        "maxResults",
      ],
    },

  },
  async run({ $ }) {
    const result = await this.app.listCompanies({
      $,
      operation: "post_companies_search",
      data: mergeDefined(this.filters, {
        query: this.query,
        semanticQuery: this.semanticQuery,
        countries: this.countries,
        keywords: this.keywords,
      }),
      query: mergeDefined({}, {
        expand: this.expand,
      }),
      maxResults: this.maxResults,
    });
    $.export("$summary", `Found ${result.length} companies`);
    return result;
  },
};
