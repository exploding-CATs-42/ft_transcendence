import type { Request, Response, NextFunction } from "express";
import { registerSchema } from "../schemas/users/registerSchema";
import { loginSchema } from "../schemas/users/loginSchema";
import { getUserByIdParamsSchema } from "../schemas/users/getUserByIdSchema";
import { searchUsersQuerySchema } from "../schemas/users/searchUsersSchema";
import { getUserGamesParamsSchema } from "../schemas/users/getUserGamesSchema";
import {
  AuthServiceError,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser
} from "../services/authService";
import {
  getPublicUserById,
  getUserGames,
  searchUsersByUsername,
  UsersServiceError
} from "../services/usersService";
import { getRefreshTokenLifetimeMs } from "../utils/tokenLifetime";

const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
const REFRESH_TOKEN_COOKIE_MAX_AGE_MS = getRefreshTokenLifetimeMs();

function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax" as const,
    path: "/api/users",
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS
  };
}

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten()
    });
  }

  try {
    const result = await registerUser(parsed.data);
    res.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      result.refreshToken,
      getRefreshTokenCookieOptions()
    );

    return res.status(201).json({
      user: result.user,
      accessToken: result.accessToken
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
  next: NextFunction
) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten()
    });
  }

  try {
    const result = await loginUser(parsed.data);
    res.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      result.refreshToken,
      getRefreshTokenCookieOptions()
    );

    return res.status(200).json({
      user: result.user,
      accessToken: result.accessToken
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
  next: NextFunction
) {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    await logoutUser(refreshToken);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax",
      path: "/api/users"
    });

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
  next: NextFunction
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
      getRefreshTokenCookieOptions()
    );

    return res.status(200).json({
      accessToken: result.accessToken
    });
  } catch (error) {
    if (error instanceof UsersServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
}

export async function searchUsersController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsed = searchUsersQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten()
    });
  }

  try {
    const users = await searchUsersByUsername(parsed.data.username);
    return res.status(200).json({ users });
  } catch (error) {
    if (error instanceof UsersServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
}

export async function getUserByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsed = getUserByIdParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten()
    });
  }

  try {
    const user = await getPublicUserById(parsed.data.userId);
    return res.status(200).json({ user });
  } catch (error) {
    if (error instanceof UsersServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
}

export async function getUserGamesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsed = getUserGamesParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten()
    });
  }

  try {
    const games = await getUserGames(parsed.data.userId);
    return res.status(200).json({ games });
  } catch (error) {
    if (error instanceof UsersServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
}
