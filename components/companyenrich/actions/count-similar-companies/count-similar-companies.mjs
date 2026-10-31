import app from "../../companyenrich.app.mjs";
import { mergeDefined } from "../../common/dispatcher.mjs";

export default {
  key: "companyenrich-count-similar-companies",
  name: "Count Similar Companies",
  description: "Count Similar Companies with CompanyEnrich. Data requests can consume credits. [See the documentation](https://docs.companyenrich.com/reference/post_companies-similar-count)",
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
    "filters": {
      "type": "object",
      "label": "Filters",
      "description": "Documented API body fields, including nested filters. Explicit action inputs take precedence. See the API reference.",
      "optional": true,
    },
    "waitForEnrichment": {
      "type": "boolean",
      "label": "Wait for Enrichment",
      "description": "Wait for enrichment where supported by the selected endpoint.",
      "optional": true,
    },

  },
  async run({ $ }) {
    const result = await this.app.request({
      operation: "post_companies_similar_count",
      body: mergeDefined(this.filters, {
        domains: this.domains,
      }),
      query: mergeDefined({}, {
        waitForEnrichment: this.waitForEnrichment,
      }),
    });
    $.export("$summary", "Count Similar Companies completed");
    return result;
  },
};
