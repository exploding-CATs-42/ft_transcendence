import { GetGameByIdParams } from "../schemas/games/getGameByIdSchema";
import { GameState } from "../types/game";

const games = new Map<string, GameState>();

export class GamesServiceError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
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
