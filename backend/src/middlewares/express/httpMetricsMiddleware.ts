import type { Request, Response, NextFunction } from "express";
import {
  httpRequestsTotal,
  httpRequestDurationSeconds,
} from "../../metrics/httpMetrics";

function getRouteLabel(req: Request, res: Response) {
  if (req.route?.path && typeof req.route.path === "string") {
    const storedBaseUrl = res.locals["metricsRouteBase"];
    const baseUrl =
      typeof storedBaseUrl === "string" ? storedBaseUrl : req.baseUrl;

    return `${baseUrl}${req.route.path}`;
  }

  return "unmatched";
}

function shouldSkipHttpMetrics(req: Request, route: string) {
  return req.baseUrl === "/metrics" || route === "/metrics/";
}

export function httpMetricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationSeconds =
      Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;

    const route = getRouteLabel(req, res);

    if (shouldSkipHttpMetrics(req, route)) {
      return;
    }

    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSeconds);
  });

  next();
}
