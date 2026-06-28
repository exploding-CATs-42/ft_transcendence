import { Counter, Histogram } from "prom-client";
import { metricRegistry } from "./registry";

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Backend HTTP request count",
  labelNames: ["method", "route", "status_code"],
  registers: [metricRegistry],
});

export const httpRequestDurationSeconds = new Histogram({
  name: "http_request_duration_seconds",
  help: "Backend HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [metricRegistry],
});
