// Libraries
import type { Response } from "express";
// Project level
import {
  createGame,
  deleteGame,
  getCurrentGame,
  getGameById,
  getGames,
} from "services";
import {
  createGameSchema,
  deleteGameParamsSchema,
  getGameByIdParamsSchema,
} from "schemas";
import { AuthenticatedRequest } from "types";
import { validate } from "utils";

export async function getGamesController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const result = await getGames(req.user.id);
  res.status(200).json(result);
}

export async function getCurrentGameController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const result = await getCurrentGame(req.user.id);
  res.status(200).json(result);
}

export async function getGameByIdController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const parsed = validate(getGameByIdParamsSchema, req.params);

  const result = await getGameById(req.user.id, parsed);
  res.status(200).json(result);
}

export async function createGameController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const parsed = validate(createGameSchema, req.body);

  const result = await createGame(req.user.id, parsed);
  res.status(201).json(result);
}

export async function deleteGameController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const parsed = validate(deleteGameParamsSchema, req.params);

  await deleteGame(req.user.id, parsed);
  res.status(200).json({ message: "Game deleted" });
}
