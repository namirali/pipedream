import app from "../../companyenrich.app.mjs";
import { mergeDefined } from "../../common/dispatcher.mjs";

export default {
  key: "companyenrich-count-companies",
  name: "Count Companies",
  description: "Count Companies with CompanyEnrich. Data requests can consume credits. [See the documentation](https://docs.companyenrich.com/reference/post_companies-search-count)",
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
    "filters": {
      "type": "object",
      "label": "Filters",
      "description": "Documented API body fields, including nested filters. Explicit action inputs take precedence. See the API reference.",
      "optional": true,
    },

  },
  async run({ $ }) {
    const result = await this.app.request({
      operation: "post_companies_search_count",
      body: mergeDefined(this.filters, {
        query: this.query,
        semanticQuery: this.semanticQuery,
      }),
    });
    $.export("$summary", "Count Companies completed");
    return result;
  },
};
