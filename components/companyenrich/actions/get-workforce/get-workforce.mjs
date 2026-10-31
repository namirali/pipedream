import app from "../../companyenrich.app.mjs";
import { mergeDefined } from "../../common/dispatcher.mjs";

export default {
  key: "companyenrich-get-workforce",
  name: "Get Company Workforce",
  description: "Get Company Workforce with CompanyEnrich. Data requests can consume credits. [See the documentation](https://docs.companyenrich.com/reference/get_companies-workforce)",
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
      "optional": true,
    },
    "id": {
      "type": "string",
      "label": "ID",
      "description": "Company UUID or positive person ID. Enter person IDs as decimal strings to preserve precision.",
      "optional": true,
    },

  },
  async run({ $ }) {
    const result = await this.app.request({
      operation: "get_companies_workforce",
      query: mergeDefined({}, {
        domain: this.domain,
        id: this.id,
      }),
    });
    $.export("$summary", "Get Company Workforce completed");
    return result;
  },
};
