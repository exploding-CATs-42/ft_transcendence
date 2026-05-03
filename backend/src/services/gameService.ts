import { prisma } from "../lib/prisma";
import { CreateGameRequestBody } from "../schemas/games/createGameSchema";
import { GetGameByIdParams } from "../schemas/games/getGameByIdSchema";
import { GameLobby, GameStatus } from "../types/game";

const games = new Map<string, GameLobby>();

export class GamesServiceError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function ensureUserExists(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true }
  });

  if (!user) {
    throw new GamesServiceError("User not found", 404);
  }
}

export async function getGames(): Promise<GameLobby[]> {
  return Array.from(games.values());
}

export async function getGameById(
  input: GetGameByIdParams
): Promise<GameLobby> {
  const game = games.get(input.gameId);

  if (!game) {
    throw new GamesServiceError("Game not found");
  }

  return game;
}

export async function createGame(
  input: CreateGameRequestBody
): Promise<GameLobby> {
  await ensureUserExists(input.playerId);

  const gameId = crypto.randomUUID();

  const game: GameLobby = {
    gameId,
    name: input.gameName,
    status: GameStatus.LOBBY,
    players: [input.playerId],
    createdAt: Date.now()
  };
  games.set(gameId, game);
  return game;
}
