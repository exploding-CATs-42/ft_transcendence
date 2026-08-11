import { Counter } from "prom-client";
import { metricRegistry } from "./registry";

export const gameOperationTotal = new Counter({
  name: "game_operation_total",
  help: "Backend game socket operation results",
  labelNames: ["operation", "status"],
  registers: [metricRegistry],
});
