// Local level
import { Game, GameId } from "./types";
import {
  createSaveLoop,
  loadGames,
  setupSignalHandlers,
  shutdown,
} from "./gamePersistence";

const games = new Map<GameId, Game>();

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

export function getGame(gameId: GameId): Game | undefined {
  assertInitialized();
  return games.get(gameId);
}

export function getAllGames(): Game[] {
  assertInitialized();
  return Array.from(games.values());
}

export function findCurrentGameByUserId(userId: string): Game | undefined {
  assertInitialized();

  return Array.from(games.values()).find((game) => {
    const snapshot = game.instance.getSnapshot();

    return snapshot.context.players.some((player) => {
      return player.id === userId;
    });
  });
}

export function addGame(game: Game): void {
  assertInitialized();
  games.set(game.id, game);
}

export function deleteGameById(gameId: string): void {
  assertInitialized();
  games.delete(gameId);
}

export default {
  getGame,
  getAllGames,
  findCurrentGameByUserId,
  addGame,
  deleteGameById,
};
