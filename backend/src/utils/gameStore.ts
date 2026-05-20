import { GameId, GameState } from "../types";
import {
  createSaveLoop,
  loadGames,
  setupSignalHandlers,
  shutdown,
} from "./gamePersistence";

const games = new Map<GameId, GameState>();

let initialized = false;

export function initGamePersistence() {
  if (initialized) return;

  loadGames(games);
  const saver = createSaveLoop(games);
  setupSignalHandlers(() => {
    shutdown(games, saver.stop);
  });

  initialized = true;
}

function assertInitialized() {
  if (!initialized) {
    throw new Error(
      "Game store not initialized. Call initGamePersistence() first.",
    );
  }
}

export function getGame(gameId: GameId): GameState | undefined {
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
  assertInitialized();
  games.delete(gameId);
}

export default {
  getGame,
  getAllGames,
  setGame,
  deleteGameById,
};
