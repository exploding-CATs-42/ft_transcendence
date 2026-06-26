// Libraries
import type { Response } from "express";
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
} from "services";
import { AuthenticatedRequest } from "types";
import { validate } from "utils";

export async function searchUsersController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const query = validate(searchUsersQuerySchema, req.query);

  const users = await searchUsersByUsername(query.username);
  res.status(200).json({ users });
}

export async function getUserByIdController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const params = validate(getUserByIdParamsSchema, req.params);

  const user = await getPublicUserById(params.userId);
  res.status(200).json({ user });
}

export async function getUserGamesController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const params = validate(getUserGamesParamsSchema, req.params);

  const games = await getUserGames(params.userId);
  res.status(200).json({ games });
}
