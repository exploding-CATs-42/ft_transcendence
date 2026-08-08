import type { Options } from "express-rate-limit";
import ms from "ms";

const WINDOW_MS = ms("15 min");
const rateLimitExcludedPaths = new Set(["/metrics"]);

export const apiRateLimitConfig: Partial<Options> = {
  limit: 100,
  windowMs: WINDOW_MS,
  skip: (req) => rateLimitExcludedPaths.has(req.path),
};
