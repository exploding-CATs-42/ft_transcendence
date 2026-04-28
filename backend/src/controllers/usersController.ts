import type { Request, Response, NextFunction } from "express";
import { registerSchema } from "../schemas/users/registerSchema";
import { loginSchema } from "../schemas/users/loginSchema";
import { logoutSchema } from "../schemas/users/logoutSchema";
import { refreshSchema } from "../schemas/users/refreshSchema";
import { getUserByIdParamsSchema } from "../schemas/users/getUserByIdSchema";
import { searchUsersQuerySchema } from "../schemas/users/searchUsersSchema";
import { getUserGamesParamsSchema } from "../schemas/users/getUserGamesSchema";
import {
  AuthServiceError,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from "../services/authService";
import {
  getPublicUserById,
  getUserGames,
  searchUsersByUsername,
  UsersServiceError,
} from "../services/usersService";

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
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
    return res.status(201).json(result);
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
      errors: parsed.error.flatten(),
    });
  }

  try {
    const result = await loginUser(parsed.data);
    return res.status(200).json(result);
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
  const parsed = logoutSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten(),
    });
  }

  try {
    await logoutUser(parsed.data);
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
  const parsed = refreshSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const result = await refreshSession(parsed.data);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof AuthServiceError) {
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
      errors: parsed.error.flatten(),
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
      errors: parsed.error.flatten(),
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
      errors: parsed.error.flatten(),
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