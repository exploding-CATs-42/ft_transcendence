import { GetGameByIdParams } from "../schemas/games/getGameByIdSchema";
import { GameLobby } from "../types/game";

const games = new Map<string, GameLobby>();

export class GamesServiceError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
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
