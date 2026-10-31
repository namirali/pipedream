import app from "../../companyenrich.app.mjs";
import { mergeDefined } from "../../common/dispatcher.mjs";

export default {
  key: "companyenrich-batch-enrich-companies",
  name: "Batch Enrich Companies",
  description: "Batch Enrich Companies with CompanyEnrich. Data requests can consume credits. [See the documentation](https://docs.companyenrich.com/reference/post_companies-enrich-batch)",
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
    "expand": {
      "type": "string[]",
      "label": "Expand",
      "description": "Optional workforce (company operations) or education (people operations) expansion. Workforce expansion can spend extra credits.",
      "optional": true,
    },

  },
  async run({ $ }) {
    const result = await this.app.request({
      operation: "post_companies_enrich_batch",
      body: {
        domains: this.domains,
      },
      query: mergeDefined({}, {
        expand: this.expand,
      }),
    });
    $.export("$summary", "Batch Enrich Companies completed");
    return result;
  },
};
