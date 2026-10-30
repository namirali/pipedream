import app from "../../companyenrich.app.mjs";

export default {
  key: "companyenrich-enrich-company",
  name: "Enrich Company",
  description: "Enrich one company by its domain. Costs 1 credit per call; a missing domain returns a 404 error. [See the documentation](https://docs.companyenrich.com/reference/get_companies-enrich)",
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
    domain: {
      propDefinition: [
        app,
        "domain",
      ],
    },
  },
  async run({ $ }) {
    const company = await this.app.enrichCompany({
      $,
      domain: this.domain,
    });
    $.export("$summary", `Enriched company ${company.id}`);
    return company;
  },
};
