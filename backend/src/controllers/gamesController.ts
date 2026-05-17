import type { Response, NextFunction } from "express";

import {
  createGame,
  deleteGame,
  getGameById,
  getGames
} from "../services/gameService";

import { getGameByIdParamsSchema } from "../schemas/games/getGameByIdSchema";
import { createGameSchema } from "../schemas/games/createGameSchema";
import { deleteGameParamsSchema } from "../schemas/games/deleteGameSchema";
import { AuthenticatedRequest } from "../types/auth";
import { validate } from "../utils/validate";

type AsyncController = (
  req: AuthenticatedRequest,
  res: Response
) => Promise<void>;

export function asyncHandler(controller: AsyncController) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    controller(req, res).catch(next);
  };
}

export async function getGamesController(
  req: AuthenticatedRequest,
  res: Response
) {
  const result = await getGames(req.user.id);
  res.status(200).json(result);
}

export async function getGameByIdController(
  req: AuthenticatedRequest,
  res: Response
) {
  const parsed = validate(getGameByIdParamsSchema, req.params);

  const result = await getGameById(req.user.id, parsed);
  res.status(200).json(result);
}

export async function createGameController(
  req: AuthenticatedRequest,
  res: Response
) {
  const parsed = validate(createGameSchema, req.body);

  const result = await createGame(req.user.id, parsed);
  res.status(201).json(result);
}

export async function deleteGameController(
  req: AuthenticatedRequest,
  res: Response
) {
  const parsed = validate(deleteGameParamsSchema, req.params);

  const result = await deleteGame(req.user.id, parsed);
  res.status(201).json(result);
}
