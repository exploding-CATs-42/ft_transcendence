import type { Request, Response, NextFunction } from "express";
import z from "zod";

import { getGameByIdParamsSchema } from "../schemas/games/getGameByIdSchema";
import {
  GamesServiceError,
  getGameById,
  getGames
} from "../services/gameService";

export async function getGamesController(
  _: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getGames();
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof GamesServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return next(error);
  }
}

export async function getGameByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsed = getGameByIdParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: z.treeifyError(parsed.error)
    });
  }

  try {
    const result = await getGameById(parsed.data);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof GamesServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return next(error);
  }
}
