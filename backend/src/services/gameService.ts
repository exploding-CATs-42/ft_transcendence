import { prisma } from "../lib/prisma";
import { CreateGameRequestBody } from "../schemas/games/createGameSchema";
import { GetGameByIdParams } from "../schemas/games/getGameByIdSchema";
import { GameState, GameStatus, Player } from "../types/game";

const games = new Map<string, GameState>();

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

export function getGames(): GameState[] {
  return Array.from(games.values());
}

export function getGameById(input: GetGameByIdParams): GameState {
  const game = games.get(input.gameId);

  if (!game) {
    throw new GamesServiceError("Game not found");
  }

  return game;
}

export async function createGame(
  input: CreateGameRequestBody
): Promise<GameState> {
  await ensureUserExists(input.playerId);

  const gameId = crypto.randomUUID();

  const createdBy: Player = {
    playerId: input.playerId,
    displayName: input.playerName
  };

  const game: GameState = {
    gameId,
    name: input.gameName,
    status: GameStatus.LOBBY,
    players: [createdBy],
    max_players: input.playersAmount,
    createdAt: Date.now()
  };
  games.set(gameId, game);
  return game;
}
