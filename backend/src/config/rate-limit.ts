import type { Request } from "express";
import type { Options } from "express-rate-limit";
import { ipKeyGenerator } from "express-rate-limit";
import ms from "ms";

const WINDOW_MS = ms("15 min");
const rateLimitExcludedPaths = new Set(["/metrics"]);

const getIpKey = (req: Request): string =>
  req.ip ? ipKeyGenerator(req.ip) : "unknown-ip";

/**
 * Limit login failures per IP and account so shared IPs don't affect
 * other users while repeated attempts against one account are restricted.
 */
const getLoginKey = (req: Request): string => {
  const email = req.body?.email;
  const account = typeof email === "string" ? email.trim().toLowerCase() : "";

  return `${getIpKey(req)}:${account}`;
};

export const apiRateLimitConfig: Partial<Options> = {
  limit: 500,
  windowMs: WINDOW_MS,
  keyGenerator: getIpKey,
  skip: (req) => rateLimitExcludedPaths.has(req.path),
};

/**
 * POST /auth/login.
 *
 * Limit failed login attempts to 10 per IP and account per 15 minutes.
 * Successful logins are not counted.
 */
export const loginRateLimitConfig: Partial<Options> = {
  limit: 10,
  windowMs: WINDOW_MS,
  keyGenerator: getLoginKey,
  skipSuccessfulRequests: true,
};
