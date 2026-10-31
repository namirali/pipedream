import app from "../../companyenrich.app.mjs";
import { mergeDefined } from "../../common/dispatcher.mjs";

export default {
  key: "companyenrich-find-similar-companies",
  name: "Find Similar Companies",
  description: "Find Similar Companies with CompanyEnrich. Data requests can consume credits. [See the documentation](https://docs.companyenrich.com/reference/post_companies-similar)",
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
    "domains": {
      "type": "string[]",
      "label": "Domains",
      "description": "Seed domains (1\u201310) for lookalikes, or 1\u201350 domains for batch enrichment.",
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
    "waitForEnrichment": {
      "type": "boolean",
      "label": "Wait for Enrichment",
      "description": "Wait for enrichment where supported by the selected endpoint.",
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
      operation: "post_companies_similar",
      data: mergeDefined(this.filters, {
        domains: this.domains,
        countries: this.countries,
        keywords: this.keywords,
      }),
      query: mergeDefined({}, {
        expand: this.expand,
        waitForEnrichment: this.waitForEnrichment,
      }),
      maxResults: this.maxResults,
    });
    $.export("$summary", `Found ${result.length} companies`);
    return result;
  },
};
