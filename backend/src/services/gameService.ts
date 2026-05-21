import { prisma } from "../lib/prisma";

import { DEFAULT_GAME_STATE } from "../constants/game";
import { ApiError } from "../errors/apiError";

import {
  CreateGameRequestBody,
  DeleteGameParams,
  GetGameByIdParams,
} from "../schemas/games";

import { GameState, UserId } from "../types";
import GameStore from "../utils/gameStore";

export async function ensureUserExists(userId: UserId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }
  return user;
}

export async function getGames(userId: UserId): Promise<GameState[]> {
  await ensureUserExists(userId);

  return GameStore.getAllGames();
}

export async function getGameById(
  userId: UserId,
  input: GetGameByIdParams,
): Promise<GameState> {
  await ensureUserExists(userId);

  const game = GameStore.getGame(input.gameId);

  if (!game) {
    throw new ApiError("Game not found", 404);
  }

  return game;
}

export async function createGame(
  userId: UserId,
  input: CreateGameRequestBody,
): Promise<GameState> {
  await ensureUserExists(userId);

  const gameId = crypto.randomUUID();

  const game: GameState = {
    ...DEFAULT_GAME_STATE,
    gameId: gameId,
    players: [],
    name: input.gameName,
    maxPlayers: input.maxPlayers,
  };

  GameStore.setGame(game);
  return game;
}

export async function deleteGame(userId: UserId, input: DeleteGameParams) {
  await ensureUserExists(userId);
  const game = GameStore.getGame(input.gameId);

  if (!game) {
    throw new ApiError("Game not found", 404);
  }
  GameStore.deleteGameById(input.gameId);
}
