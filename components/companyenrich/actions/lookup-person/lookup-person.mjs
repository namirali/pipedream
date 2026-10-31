import app from "../../companyenrich.app.mjs";
import { mergeDefined } from "../../common/dispatcher.mjs";

export default {
  key: "companyenrich-lookup-person",
  name: "Lookup Person",
  description: "Lookup Person with CompanyEnrich. Data requests can consume credits. [See the documentation](https://docs.companyenrich.com/reference/post_people-lookup)",
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
    "email": {
      "type": "string",
      "label": "Email",
      "description": "Email address to look up.",
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
      operation: "post_people_lookup",
      body: {
        email: this.email,
      },
      query: mergeDefined({}, {
        expand: this.expand,
      }),
    });
    $.export("$summary", "Lookup Person completed");
    return result;
  },
};
