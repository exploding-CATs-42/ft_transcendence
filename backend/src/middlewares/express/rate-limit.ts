// Libraries
import { rateLimit } from "express-rate-limit";
// Project level
import { apiRateLimitConfig, loginRateLimitConfig } from "config";

export const apiRateLimiter = rateLimit(apiRateLimitConfig);
export const loginRateLimiter = rateLimit(loginRateLimitConfig);
