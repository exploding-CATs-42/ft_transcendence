import { Counter } from "prom-client";
import { metricRegistry } from "./registry";

export const userOperationTotal = new Counter({
  name: "user_operation_total",
  help: "Backend user operation results",
  labelNames: ["operation", "status"],
  registers: [metricRegistry],
});
