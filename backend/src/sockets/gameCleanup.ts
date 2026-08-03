import { GameRepository } from "data";
import { GameId } from "data/types";

const GAME_OVER_CLEANUP_DELAY_MS = 60000;

const timers = new Map<GameId, NodeJS.Timeout>();

export const scheduleGameCleanup = (gameId: GameId) => {
  timers.set(
    gameId,
    setTimeout(() => deleteGame(gameId), GAME_OVER_CLEANUP_DELAY_MS),
  );
};

export const deleteGame = (gameId: GameId) => {
  timers.delete(gameId);

  const game = GameRepository.getGame(gameId);

  if (!game) return;

  GameRepository.deleteGameById(gameId);
};
