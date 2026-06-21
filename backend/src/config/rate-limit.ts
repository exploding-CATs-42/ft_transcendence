import type { Options } from "express-rate-limit";
import ms from "ms";

export const apiRateLimitConfig: Partial<Options> = {
  limit: 100,
  windowMs: ms("15 min"),
};
