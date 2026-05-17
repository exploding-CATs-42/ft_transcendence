import { prisma } from "../lib/prisma";
import { CreateGameRequestBody } from "../schemas/games/createGameSchema";
import { DeleteGameParams } from "../schemas/games/deleteGameSchema";
import { GetGameByIdParams } from "../schemas/games/getGameByIdSchema";
import { GameState, GameStatus, Player } from "../types/game";
import {
  deleteGameById,
  getAllGames,
  getGame,
  setGame
} from "../utils/gameStore";

export class GamesServiceError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function ensureUserExists(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true }
  });

  if (!user) {
    throw new GamesServiceError("User not found", 404);
  }
  return user;
}

export async function getGames(currentUserId: string): Promise<GameState[]> {
  await ensureUserExists(currentUserId);

  return getAllGames();
}

export async function getGameById(
  currentUserId: string,
  input: GetGameByIdParams
): Promise<GameState> {
  await ensureUserExists(currentUserId);

  const game = getGame(input.gameId);

  if (!game) {
    throw new GamesServiceError("Game not found");
  }

  return game;
}

export async function createGame(
  currentUserId: string,
  input: CreateGameRequestBody
): Promise<GameState> {
  const user = await ensureUserExists(currentUserId);

  const gameId = crypto.randomUUID();

  const createdBy: Player = {
    playerId: user.id,
    displayName: user.username
  };

  const game: GameState = {
    gameId,
    name: input.gameName,
    status: GameStatus.LOBBY,
    players: [createdBy],
    max_players: input.playersAmount,
    createdAt: Date.now()
  };
  setGame(game);
  return game;
}

export async function deleteGame(
  currentUserId: string,
  input: DeleteGameParams
) {
  await ensureUserExists(currentUserId);
  const game = getGame(input.gameId);

  if (!game) {
    throw new GamesServiceError("Game not found");
  }
  deleteGameById(input.gameId);
}
