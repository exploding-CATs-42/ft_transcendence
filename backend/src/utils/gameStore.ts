import { GameInstance } from "../game/types";
import { GameId } from "../types";
import {
  createSaveLoop,
  loadGames,
  setupSignalHandlers,
  shutdown,
} from "./gamePersistence";

const games = new Map<GameId, GameInstance>();

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

export function getGame(gameId: GameId): GameInstance | undefined {
  assertInitialized();
  return games.get(gameId);
}

export function getAllGames(): GameInstance[] {
  assertInitialized();
  return Array.from(games.values());
}

export function setGame(game: GameInstance): void {
  assertInitialized();
  games.set(game.info.id, game);
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
