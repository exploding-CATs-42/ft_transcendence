// Local level
import { Game, GameId } from "./types";

const games = new Map<GameId, Game>();

export function getGame(gameId: GameId): Game | undefined {
  return games.get(gameId);
}

export function getAllGames(): Game[] {
  return Array.from(games.values());
}

export function findCurrentGameByUserId(userId: string): Game | undefined {
  return Array.from(games.values()).find((game) => {
    const snapshot = game.instance.getSnapshot();

    return snapshot.context.players.some((player) => {
      return player.id === userId;
    });
  });
}

export function addGame(game: Game): void {
  games.set(game.id, game);
}

export function deleteGameById(gameId: string): void {
  games.delete(gameId);
}

export default {
  getGame,
  getAllGames,
  findCurrentGameByUserId,
  addGame,
  deleteGameById,
};
