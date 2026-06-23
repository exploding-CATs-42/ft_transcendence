// Libraries
import { rateLimit } from "express-rate-limit";
// Project level
import { apiRateLimitConfig } from "../../config";

export const apiRateLimiter = rateLimit(apiRateLimitConfig);
