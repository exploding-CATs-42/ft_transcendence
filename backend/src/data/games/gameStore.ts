// Project level
import { getGameContext } from "game/utils";
// Local level
import { Game, GameId } from "./types";

const games = new Map<GameId, Game>();

export function getGame(gameId: GameId): Game | undefined {
  return games.get(gameId);
}

export function getAllGames(): Game[] {
  return Array.from(games.values());
}

export function addGame(game: Game): void {
  games.set(game.id, game);
}

export function deleteGameById(gameId: string): boolean {
  return games.delete(gameId);
}

export function findCurrentGameByUserId(userId: string): Game | undefined {
  return Array.from(games.values()).find((game) => {
    const players = getGameContext(game.instance).players;

    return players.some((player) => {
      return player.id === userId;
    });
  });
}

export default {
  getGame,
  getAllGames,
  addGame,
  deleteGameById,
  findCurrentGameByUserId,
};
