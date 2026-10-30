CompanyEnrich actions enrich a company by domain, search companies, and find similar companies from seed domains.

Connect an API key from the [CompanyEnrich dashboard](https://app.companyenrich.com/) without the `Bearer` prefix. Connected-app registration is requested in [Pipedream issue 22385](https://github.com/PipedreamHQ/pipedream/issues/22385); these components require that registration before use in Pipedream.

Enrichment costs 1 credit per call. Search costs 1 credit per returned company, with a 1-credit minimum per request. Similar-company discovery costs 5 credits per returned company, with a 5-credit minimum per request. **Max Results** defaults to 10 and caps pagination at 10,000 companies. The actions do not implement retries of paid requests.

The search actions return an array of company records. Similar-company match-score metadata is not included in that array. See the [API reference](https://docs.companyenrich.com/reference) for response fields and plan requirements.

Run the mocked request tests on Node.js 22 or later:

```sh
node --experimental-test-module-mocks --test components/companyenrich/companyenrich.test.mjs
```

These tests do not call CompanyEnrich. Authenticated Pipedream execution remains to be verified after app registration.
