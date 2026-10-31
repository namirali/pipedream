# CompanyEnrich components

Twelve native actions cover company domain enrichment, company search, lookalikes, people search, email lookup, company workforce, company matching by properties, batch enrichment, company/person retrieval by ID, and company/similar counts. **Advanced Request** exposes all 42 documented data, lookup and job operations in a fixed selector. The five saved-list administration operations and account `/me` response are excluded.

Connect an API key from the [CompanyEnrich dashboard](https://app.companyenrich.com/) without the `Bearer` prefix. Connected-app registration is requested in [Pipedream issue 22385](https://github.com/PipedreamHQ/pipedream/issues/22385); these components require registration before use in Pipedream. This source has not been published to the marketplace.

Company search supports literal `query`, natural-language `semanticQuery`, countries, keywords and a full structured `filters` object. Explicit inputs override matching filter keys. Similar-company search accepts 1–10 seed domains and full filters. Batch enrichment accepts 1–50 domains. Properties enrichment requires at least one name or social property; workforce requires exactly one domain or UUID. Person IDs are decimal strings so large IDs are not rounded. Supported operations accept `expand` (`workforce` for companies, `education` for people) and `waitForEnrichment`; workforce expansion can spend extra credits.

The existing Search Companies and Find Similar Companies actions retain their array output and Max Results behavior: default 10 (one page), capped at 10,000. Larger limits issue more requests and spend more credits. Full unmodified page responses, including pagination, metadata, similarity scores and future fields, are available in the named `pages` step export. Use Advanced Request for an explicit company search page/pageSize rather than placing these keys in Filters. Other native and advanced actions return the complete API JSON, including arrays and numeric zero counts.

Advanced Request makes exactly one API request and never retries, paginates, polls a job, or downloads a result URL. Supply documented `body`, `query`, and `path_parameters` objects. Paged requests default to page 1 and page size 10; page size is 1–100 and page times page size is capped at 10,000. Export creation requires an explicit count of 1–50,000 (the conservative prose limit); bulk jobs require explicit domains/items. Returned job/status/result links are left to a later caller-controlled step. The three email operations are beta and require `allow_beta=true` explicitly.

Enrichment costs 1 credit per call; search costs 1 per returned company (1 minimum per request), and similar-company discovery costs 5 per company (5 minimum). See the [official API reference](https://docs.companyenrich.com/reference) for other costs and account requirements. Native fetch uses a 30-second timeout, disables redirects, and reports sanitized status/transport errors. Paid requests are never automatically retried.

Run the mocked request suite on Node.js 22 or later:

```sh
node --test components/companyenrich/common-companyenrich.test.mjs
```

Tests cover all native actions and all 42 advanced routes, lossless outputs/filters, input limits, beta opt-in, integer precision and credential-safe errors. No live API call or paid operation is performed. Hosted execution remains unverified until app registration and an authenticated test are available.
