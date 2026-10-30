import { ConfigurationError } from "@pipedream/platform";
import app from "../../companyenrich.app.mjs";

export default {
  key: "companyenrich-find-similar-companies",
  name: "Find Similar Companies",
  description: "Discover lookalike companies using one to ten seed domains. Costs 5 credits per returned company, with a 5-credit minimum per request. [See the documentation](https://docs.companyenrich.com/reference/post_companies-similar)",
  version: "0.0.1",
  type: "action",
  ai: "optimized",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: true,
  },
  props: {
    app,
    domains: {
      type: "string[]",
      label: "Seed Domains",
      description: "One to ten company domains to find lookalikes for, for example `example.com`.",
    },
    countries: {
      propDefinition: [
        app,
        "countries",
      ],
    },
    keywords: {
      propDefinition: [
        app,
        "keywords",
      ],
    },
    maxResults: {
      propDefinition: [
        app,
        "maxResults",
      ],
    },
  },
  async run({ $ }) {
    if (!this.domains?.length || this.domains.length > 10) {
      throw new ConfigurationError("Provide between one and ten seed domains.");
    }
    const companies = await this.app.findSimilarCompanies({
      $,
      data: {
        domains: this.domains,
        countries: this.countries,
        keywords: this.keywords,
      },
      maxResults: this.maxResults,
    });
    $.export("$summary", `Found ${companies.length} similar companies`);
    return companies;
  },
};
