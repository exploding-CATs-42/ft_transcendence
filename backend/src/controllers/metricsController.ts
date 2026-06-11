import type { NextFunction, Request, Response } from "express";
import { metricRegistry } from "../metrics/registry";

export async function getMetricsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.set("Content-Type", metricRegistry.contentType);
    return res.send(await metricRegistry.metrics());
  } catch (error) {
    return next(error);
  }
}
