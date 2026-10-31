import app from "../../companyenrich.app.mjs";
import { mergeDefined } from "../../common/dispatcher.mjs";

export default {
  key: "companyenrich-search-people",
  name: "Search People",
  description: "Search People with CompanyEnrich. Data requests can consume credits. [See the documentation](https://docs.companyenrich.com/reference/post_people-search)",
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
    "filters": {
      "type": "object",
      "label": "Filters",
      "description": "Documented API body fields, including nested filters. Explicit action inputs take precedence. See the API reference.",
      "optional": true,
    },
    "domains": {
      "type": "string[]",
      "label": "Domains",
      "description": "Seed domains (1\u201310) for lookalikes, or 1\u201350 domains for batch enrichment.",
      "optional": true,
    },
    "page": {
      "type": "integer",
      "label": "Page",
      "description": "One-based page. One request per execution.",
      "default": 1,
      "min": 1,
      "optional": true,
    },
    "pageSize": {
      "type": "integer",
      "label": "Page Size",
      "description": "Results per request (1\u2013100); additional requests can spend credits.",
      "default": 10,
      "min": 1,
      "max": 100,
      "optional": true,
    },
    "expand": {
      "type": "string[]",
      "label": "Expand",
      "description": "Optional workforce (company operations) or education (people operations) expansion. Workforce expansion can spend extra credits.",
      "optional": true,
    },

  },
  async run({ $ }) {
    const result = await this.app.request({
      operation: "post_people_search",
      body: mergeDefined(this.filters, {
        domains: this.domains,
        page: this.page ?? 1,
        pageSize: this.pageSize ?? 10,
      }),
      query: mergeDefined({}, {
        expand: this.expand,
      }),
    });
    $.export("$summary", "Search People completed");
    return result;
  },
};
