// Project level
import { createGameInstance } from "game";
// Local level
import { Game, GameId } from "./types";
import GameStore from "./gameStore";

const createGame = (name: string, maxPlayers: number) => {
  const game: Game = {
    id: crypto.randomUUID(),
    name,
    maxPlayers,
    createdAt: Date.now(),
    instance: createGameInstance(),
  };

  GameStore.addGame(game);

  return game;
};

const addGame = (game: Game) => {
  GameStore.addGame(game);
};

const getGame = (gameId: GameId): Game | undefined => {
  return GameStore.getGame(gameId);
};

const getAllGames = (): Game[] => {
  return GameStore.getAllGames();
};

const deleteGameById = (gameId: GameId): boolean => {
  return GameStore.deleteGameById(gameId);
};

const findCurrentGameByUserId = (userId: string): Game | undefined => {
  return GameStore.findCurrentGameByUserId(userId);
};

export default {
  createGame,
  addGame,
  getGame,
  getAllGames,
  deleteGameById,
  findCurrentGameByUserId,
};
