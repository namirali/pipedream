import app from "../../companyenrich.app.mjs";
import { OPERATIONS } from "../../common/dispatcher.mjs";

export default {
  key: "companyenrich-advanced-request",
  name: "Advanced Request",
  description: "Execute one allowlisted CompanyEnrich data, lookup or job operation. Paid requests are not retried, paginated or polled. Email beta operations require explicit opt-in. [See the documentation](https://docs.companyenrich.com/reference)",
  version: "0.0.1",
  type: "action",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    openWorldHint: true,
  },
  props: {
    app,
    operation: {
      type: "string",
      label: "Operation",
      description: "Choose a documented operation. Each execution makes exactly one API request.",
      options: Object.entries(OPERATIONS).map(([
        value,
        op,
      ]) => ({
        value,
        label: `${op.method} ${op.path}: ${op.title}${op.beta
          ? " (beta)"
          : ""}`,
      })),
    },
    body: {
      type: "object",
      label: "Body",
      description: "Full documented JSON request body. Export jobs require an explicit count (max 50,000); bulk jobs require domains/items.",
      optional: true,
    },
    query: {
      type: "object",
      label: "Query Parameters",
      description: "Documented query parameters only; use arrays for expand.",
      optional: true,
    },
    path_parameters: {
      type: "object",
      label: "Path Parameters",
      description: "Documented path parameters, such as jobId or countryCode.",
      optional: true,
    },
    allow_beta: {
      type: "boolean",
      label: "Allow Beta Email Operations",
      description: "Explicitly opt in to beta email operations and their credit costs.",
      default: false,
      optional: true,
    },
  },
  async run({ $ }) {
    const result = await this.app.request({
      operation: this.operation,
      body: this.body,
      query: this.query,
      path_parameters: this.path_parameters,
      allow_beta: this.allow_beta,
    });
    $.export("$summary", "CompanyEnrich request completed");
    return result;
  },
};
