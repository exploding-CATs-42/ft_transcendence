import type { Options } from "express-rate-limit";
import ms from "ms";

const isDevelopment = process.env.NODE_ENV === "development";
const rateLimitExcludedPaths = new Set(["/metrics"]);

export const apiRateLimitConfig: Partial<Options> = {
  limit: isDevelopment ? 10_000 : 100,
  windowMs: ms("15 min"),
  skip: (req) => rateLimitExcludedPaths.has(req.path),
};
