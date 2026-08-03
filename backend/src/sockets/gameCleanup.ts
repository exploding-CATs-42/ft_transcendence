import { GameRepository } from "data";
import { GameId } from "data/types";

const GAME_OVER_CLEANUP_DELAY_MS = 60000;

const timers = new Map<GameId, NodeJS.Timeout>();

export const scheduleGameCleanup = (gameId: GameId) => {
  cancelGameCleanup(gameId);

  timers.set(
    gameId,
    setTimeout(() => deleteGame(gameId), GAME_OVER_CLEANUP_DELAY_MS),
  );
};

export const cancelGameCleanup = (gameId: GameId) => {
  const timer = timers.get(gameId);

  if (!timer) return;

  clearTimeout(timer);
  timers.delete(gameId);
};

export const deleteGame = (gameId: GameId) => {
  timers.delete(gameId);

  const game = GameRepository.getGame(gameId);

  if (!game) return;

  GameRepository.deleteGameById(gameId);
};
