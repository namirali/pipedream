import app from "../../companyenrich.app.mjs";
import { mergeDefined } from "../../common/dispatcher.mjs";

export default {
  key: "companyenrich-enrich-company",
  name: "Enrich Company",
  description: "Enrich Company with CompanyEnrich. Data requests can consume credits. [See the documentation](https://docs.companyenrich.com/reference/get_companies-enrich)",
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
    "domain": {
      "propDefinition": [
        app,
        "domain",
      ],
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

  },
  async run({ $ }) {
    const result = await this.app.request({
      operation: "get_companies_enrich",
      query: mergeDefined({}, {
        domain: this.domain,
        expand: this.expand,
        waitForEnrichment: this.waitForEnrichment,
      }),
    });
    $.export("$summary", "Enrich Company completed");
    return result;
  },
};
