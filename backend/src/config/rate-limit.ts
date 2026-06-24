import type { Options } from "express-rate-limit";
import ms from "ms";

const isDevelopment = process.env.NODE_ENV === "development";

export const apiRateLimitConfig: Partial<Options> = {
  limit: isDevelopment ? 10_000 : 100,
  windowMs: ms("15 min"),
};
