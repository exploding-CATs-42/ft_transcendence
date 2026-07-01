import { collectDefaultMetrics, Registry } from "prom-client";

export const metricRegistry = new Registry();

collectDefaultMetrics({
  register: metricRegistry,
});
