import { GameState } from "../types";
import {
  loadGames,
  setupShutdownHandlers,
  startAutoSave
} from "./gamePersistence";

const games = new Map<string, GameState>();

let initialized = false;

export function initGamePersistence() {
  if (initialized) return;

  loadGames(games);
  startAutoSave(games);
  setupShutdownHandlers(games);

  initialized = true;
}

function assertInitialized() {
  if (!initialized) {
    throw new Error(
      "Game store not initialized. Call initGamePersistence() first."
    );
  }
}

export function getGame(gameId: string): GameState | undefined {
  assertInitialized();
  return games.get(gameId);
}

export function getAllGames(): GameState[] {
  assertInitialized();
  return Array.from(games.values());
}

export function setGame(game: GameState): void {
  assertInitialized();
  games.set(game.gameId, game);
}

export function deleteGameById(gameId: string): void {
  games.delete(gameId);
}
