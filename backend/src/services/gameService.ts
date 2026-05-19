import { ApiError } from "../errors/apiError";
import { prisma } from "../lib/prisma";
import { CreateGameRequestBody } from "../schemas/games/createGameSchema";
import { DeleteGameParams } from "../schemas/games/deleteGameSchema";
import { GetGameByIdParams } from "../schemas/games/getGameByIdSchema";
import { DEFAULT_GAME_STATE, GameState } from "../types/game";
import {
  deleteGameById,
  getAllGames,
  getGame,
  setGame
} from "../utils/gameStore";

export async function ensureUserExists(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true }
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }
  return user;
}

export async function getGames(userId: string): Promise<GameState[]> {
  await ensureUserExists(userId);

  return getAllGames();
}

export async function getGameById(
  userId: string,
  input: GetGameByIdParams
): Promise<GameState> {
  await ensureUserExists(userId);

  const game = getGame(input.gameId);

  if (!game) {
    throw new ApiError("Game not found", 404);
  }

  return game;
}

export async function createGame(
  userId: string,
  input: CreateGameRequestBody
): Promise<GameState> {
  await ensureUserExists(userId);

  const gameId = crypto.randomUUID();

  const game: GameState = {
    ...DEFAULT_GAME_STATE,
    gameId: gameId,
    players: [],
    name: input.gameName,
    maxPlayers: input.maxPlayers
  };

  setGame(game);
  return game;
}

export async function deleteGame(userId: string, input: DeleteGameParams) {
  await ensureUserExists(userId);
  const game = getGame(input.gameId);

  if (!game) {
    throw new ApiError("Game not found", 404);
  }
  deleteGameById(input.gameId);
}
