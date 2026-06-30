// Libraries
import type { Response } from "express";
// Project level
import {
  createGame,
  getCurrentGame,
  getGames,
  joinGame,
  leaveGame,
} from "services";
import { createGameSchema, joinGameSchema, leaveGameSchema } from "schemas";
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

export async function createGameController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const parsed = validate(createGameSchema, req.body);

  const result = await createGame(req.user.id, parsed);
  res.status(201).json(result);
}

export async function joinGameController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const parsed = validate(joinGameSchema, req.params);

  const result = await joinGame(parsed, req.user.id);
  res.status(200).json(result);
}

export async function leaveGameController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const parsed = validate(leaveGameSchema, req.params);

  const result = await leaveGame(parsed, req.user.id);
  res.status(200).json(result);
}
