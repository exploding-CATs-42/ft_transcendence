// Project level
import { getGameContext } from "@exploding-cats/game-core";
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
  return [...games.values()].find((game) => {
    const players = getGameContext(game.instance).players;
    return players.some((player) => {
      return player.id === userId;
    });
  });
}

export function addGame(game: Game): void {
  games.set(game.id, game);
}

export function deleteGameById(gameId: string): boolean {
  return games.delete(gameId);
}

export default {
  getGame,
  getAllGames,
  findCurrentGameByUserId,
  addGame,
  deleteGameById,
};
