import { GameRepository } from "data";
import { GameId } from "data/types";

export const deleteGame = (gameId: GameId) => {
  const game = GameRepository.getGame(gameId);

  if (!game) return;

  GameRepository.deleteGameById(gameId);
};
