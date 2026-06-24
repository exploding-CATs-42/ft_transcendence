// Libraries
import type { Request, Response, NextFunction } from "express";
// Project level
import { registerSchema, loginSchema } from "@exploding-cats/contracts";
import {
  AuthServiceError,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from "services";
import { getRefreshTokenLifetimeMs } from "utils/tokenLifetime";

const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
const REFRESH_TOKEN_COOKIE_MAX_AGE_MS = getRefreshTokenLifetimeMs();
const REFRESH_TOKEN_COOKIE_PATH = "/api/auth";

function getRefreshTokenClearCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax" as const,
    path: REFRESH_TOKEN_COOKIE_PATH,
  };
}

function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax" as const,
    path: REFRESH_TOKEN_COOKIE_PATH,
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
  };
}

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const result = await registerUser(parsed.data);

    return res.status(201).json({
      user: result.user,
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const result = await loginUser(parsed.data);
    res.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      result.refreshToken,
      getRefreshTokenCookieOptions(),
    );

    return res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
}

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    await logoutUser(refreshToken);
    res.clearCookie(
      REFRESH_TOKEN_COOKIE_NAME,
      getRefreshTokenClearCookieOptions(),
    );

    return res.status(204).send();
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
}

export async function refreshController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const result = await refreshSession(refreshToken);
    res.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      result.refreshToken,
      getRefreshTokenCookieOptions(),
    );

    return res.status(200).json({
      accessToken: result.accessToken,
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      res.clearCookie(
        REFRESH_TOKEN_COOKIE_NAME,
        getRefreshTokenClearCookieOptions(),
      );

      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
}
