import { GameOutEvents, GameStates } from "@exploding-cats/game-core";
import { GameRepository } from "data";
import { Game, GameId } from "data/types";
import { io } from "../app";
import { ServerPrivateEvents } from "@exploding-cats/contracts";
import { cancelAutoPlay } from "./autoPlay";

const GAME_OVER_CLEANUP_DELAY_MS = 60000;

const timers = new Map<GameId, NodeJS.Timeout>();

export const attachGameCleanup = (game: Game) => {
  game.instance.on(GameOutEvents.GAME_OVER, () => {
    scheduleGameCleanup(game.id);
  });

  if (game.instance.getSnapshot().matches(GameStates.GAME_OVER)) {
    scheduleGameCleanup(game.id);
  }
};

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

  const { players } = game.instance.getSnapshot().context;

  players.forEach((player) => {
    cancelAutoPlay(player.id);
  });

  io.to(gameId).emit(ServerPrivateEvents.LEFT_GAME);
  io.in(gameId).socketsLeave(gameId);

  GameRepository.deleteGameById(gameId);
};
