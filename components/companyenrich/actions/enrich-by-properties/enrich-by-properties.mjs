import app from "../../companyenrich.app.mjs";
import { mergeDefined } from "../../common/dispatcher.mjs";

export default {
  key: "companyenrich-enrich-by-properties",
  name: "Enrich by Properties",
  description: "Enrich by Properties with CompanyEnrich. Data requests can consume credits. [See the documentation](https://docs.companyenrich.com/reference/post_companies-enrich)",
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
    "properties": {
      "type": "object",
      "label": "Company Properties",
      "description": "At least one name, linkedinUrl, linkedinId, twitterUrl, facebookUrl, instagramUrl or youTubeUrl.",
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
      operation: "post_companies_enrich",
      body: this.properties,
      query: mergeDefined({}, {
        expand: this.expand,
      }),
    });
    $.export("$summary", "Enrich by Properties completed");
    return result;
  },
};
