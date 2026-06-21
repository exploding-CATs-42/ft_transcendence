// Libraries
import type { Request, Response, NextFunction } from "express";
// Project level
import {
  getUserByIdParamsSchema,
  searchUsersQuerySchema,
  getUserGamesParamsSchema,
} from "schemas";
import {
  getPublicUserById,
  getUserGames,
  searchUsersByUsername,
  UsersServiceError,
} from "services";

export async function searchUsersController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsed = searchUsersQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten(),
    });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Invalid token" });
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
  next: NextFunction,
) {
  const parsed = getUserByIdParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten(),
    });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Invalid token" });
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
  next: NextFunction,
) {
  const parsed = getUserGamesParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten(),
    });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Invalid token" });
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
