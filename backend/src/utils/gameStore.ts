import { GameState } from "../types";

const games = new Map<string, GameState>();

export function getGame(gameId: string): GameState | undefined {
  return games.get(gameId);
}

export function getAllGames(): GameState[] {
  return Array.from(games.values());
}

export function setGame(game: GameState): void {
  games.set(game.gameId, game);
}

export function deleteGameById(gameId: string): void {
  games.delete(gameId);
}
