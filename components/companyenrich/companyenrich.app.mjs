import { ConfigurationError } from "@pipedream/platform";
import { prepareOperation } from "./common/dispatcher.mjs";

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
    async request(input) {
      const request = prepareOperation(input);
      const key = this.$auth.api_key;
      if (typeof key !== "string" || !key.trim()) {
        throw new ConfigurationError("A CompanyEnrich API key is required.");
      }
      let response;
      try {
        response = await fetch(request.url, {
          method: request.method,
          headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: request.body,
          signal: AbortSignal.timeout(30000),
          redirect: "error",
        });
      } catch {
        throw new Error("CompanyEnrich request failed or timed out. No retry was attempted.");
      }
      if (!response.ok) {
        throw new Error(`CompanyEnrich request failed (HTTP ${response.status}).`);
      }
      try {
        return await response.json();
      } catch {
        throw new Error("CompanyEnrich returned invalid JSON. No retry was attempted.");
      }
    },
    async listCompanies({
      $, operation, data, query, maxResults = 10,
    }) {
      if (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 10000) {
        throw new ConfigurationError("Max Results must be an integer between 1 and 10000.");
      }
      if (data.page !== undefined || data.pageSize !== undefined) {
        throw new ConfigurationError("Use Max Results to control these actions; use Advanced Request for an explicit page/pageSize.");
      }
      const companies = [];
      const pages = [];
      while (companies.length < maxResults) {
        let pageSize = Math.min(maxResults - companies.length, 100);
        while (companies.length % pageSize !== 0) pageSize--;
        const page = companies.length / pageSize + 1;
        const response = await this.request({
          operation,
          body: {
            ...data,
            page,
            pageSize,
          },
          query,
        });
        if (!response || !Array.isArray(response.items)) {
          throw new Error("CompanyEnrich returned an invalid company page. No retry was attempted.");
        }
        pages.push(response);
        companies.push(...response.items.slice(0, maxResults - companies.length));
        if (page >= response.totalPages || response.items.length < pageSize) break;
      }
      $.export("pages", pages);
      return companies;
    },
  },
};
