// Libraries
import type { Response } from "express";
// Project level
import {
  createGame,
  deleteGameById,
  getCurrentGame,
  getGameById,
  getAllGames,
} from "services";
import {
  createGameSchema,
  deleteGameParamsSchema,
  getGameByIdParamsSchema,
} from "schemas";
import { AuthenticatedRequest } from "types";
import { validate } from "utils";

export async function getAllGamesController(
  _req: AuthenticatedRequest,
  res: Response,
) {
  const result = await getAllGames();
  res.status(200).json(result);
}

export async function getCurrentGameController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const result = getCurrentGame(req.user.id);
  if (!result.ok) {
    res.status(404).json(result.error);
    return;
  }

  res.status(200).json(result.value);
}

export async function getGameByIdController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const parsed = validate(getGameByIdParamsSchema, req.params);

  const result = getGameById(parsed.gameId);
  if (!result.ok) {
    res.status(404).json(result.error);
    return;
  }

  res.status(200).json(result.value);
}

export async function createGameController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const parsed = validate(createGameSchema, req.body);

  const result = createGame(req.user.id, {
    name: parsed.gameName,
    maxPlayers: parsed.maxPlayers,
  });

  if (!result.ok) {
    res.status(409).json(result.error);
    return;
  }

  res.status(201).json(result.value);
}

export async function deleteGameByIdController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const parsed = validate(deleteGameParamsSchema, req.params);

  const result = deleteGameById(parsed.gameId);
  if (!result.ok) res.status(404).json(result.error);

  res.status(201).send();
}
