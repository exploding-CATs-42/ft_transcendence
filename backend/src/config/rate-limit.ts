import type { Request } from "express";
import type { Options } from "express-rate-limit";
import { ipKeyGenerator } from "express-rate-limit";
import ms from "ms";

const WINDOW_MS = ms("15 min");
const rateLimitExcludedPaths = new Set(["/metrics"]);

const getIpKey = (req: Request): string =>
  req.ip ? ipKeyGenerator(req.ip) : "unknown-ip";

export const apiRateLimitConfig: Partial<Options> = {
  limit: 500,
  windowMs: WINDOW_MS,
  keyGenerator: getIpKey,
  skip: (req) => rateLimitExcludedPaths.has(req.path),
};
