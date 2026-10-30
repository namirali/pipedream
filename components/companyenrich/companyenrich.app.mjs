import {
  axios, ConfigurationError,
} from "@pipedream/platform";

export default {
  type: "app",
  app: "companyenrich",
  propDefinitions: {
    domain: {
      type: "string",
      label: "Company Domain",
      description: "The company's domain, for example `example.com`.",
    },
    countries: {
      type: "string[]",
      label: "Countries",
      description: "Filter by two-letter country codes, for example `US` or `GB`.",
      optional: true,
    },
    keywords: {
      type: "string[]",
      label: "Keywords",
      description: "Filter companies by keywords, for example `cybersecurity`.",
      optional: true,
    },
    maxResults: {
      type: "integer",
      label: "Max Results",
      description: "Maximum companies to retrieve (default 10, one page). Larger limits request more pages and spend additional credits; each request has a minimum credit charge.",
      default: 10,
      min: 1,
      max: 10000,
      optional: true,
    },
  },
  methods: {
    _makeRequest({
      $, path, ...options
    }) {
      return axios($, {
        ...options,
        url: `https://api.companyenrich.com${path}`,
        headers: {
          "Authorization": `Bearer ${this.$auth.api_key}`,
          "Content-Type": "application/json",
        },
      });
    },
    enrichCompany({
      $, domain,
    }) {
      return this._makeRequest({
        $,
        path: "/companies/enrich",
        params: {
          domain,
        },
      });
    },
    async listCompanies({
      $, path, data, maxResults = 10,
    }) {
      if (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 10000) {
        throw new ConfigurationError("Max Results must be an integer between 1 and 10000.");
      }
      const companies = [];
      while (companies.length < maxResults) {
        let pageSize = Math.min(maxResults - companies.length, 100);
        while (companies.length % pageSize !== 0) {
          pageSize--;
        }
        const page = companies.length / pageSize + 1;
        const response = await this._makeRequest({
          $,
          path,
          method: "POST",
          data: {
            ...data,
            page,
            pageSize,
          },
        });
        companies.push(...response.items.slice(0, maxResults - companies.length));
        if (page >= response.totalPages || response.items.length < pageSize) {
          break;
        }
      }
      return companies;
    },
    searchCompanies(options) {
      return this.listCompanies({
        ...options,
        path: "/companies/search",
      });
    },
    findSimilarCompanies(options) {
      return this.listCompanies({
        ...options,
        path: "/companies/similar",
      });
    },
  },
};
