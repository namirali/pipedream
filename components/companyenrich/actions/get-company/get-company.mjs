import app from "../../companyenrich.app.mjs";
import { mergeDefined } from "../../common/dispatcher.mjs";

export default {
  key: "companyenrich-get-company",
  name: "Get Company",
  description: "Get Company with CompanyEnrich. Data requests can consume credits. [See the documentation](https://docs.companyenrich.com/reference/get_companies)",
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
    "id": {
      "type": "string",
      "label": "ID",
      "description": "Company UUID or positive person ID. Enter person IDs as decimal strings to preserve precision.",
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
      operation: "get_companies",
      query: mergeDefined({}, {
        id: this.id,
        expand: this.expand,
      }),
    });
    $.export("$summary", "Get Company completed");
    return result;
  },
};
