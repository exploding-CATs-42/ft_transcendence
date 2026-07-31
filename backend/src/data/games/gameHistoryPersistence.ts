import { GameOutEvents, GameStates } from "@exploding-cats/game-core";
import type { Game } from "./types";
import {
  persistFinishedGame,
  persistStartedGame,
} from "./gameHistoryRepository";

const logPersistenceError = (
  operation: "start" | "finish",
  gameId: string,
  error: unknown,
) => {
  console.error(`Failed to persist game ${operation}: ${gameId}`, error);
};

const persistCurrentFinishedGame = (game: Game, winnerUserId: string) => {
  const playerIds = game.instance
    .getSnapshot()
    .context.players.map((player) => player.id);

  void persistFinishedGame(game, winnerUserId, playerIds).catch((error) => {
    logPersistenceError("finish", game.id, error);
  });
};

export function attachGameHistoryPersistence(game: Game) {
  game.instance.on(GameOutEvents.GAME_STARTED, (event) => {
    const playerIds = event.players.map((player) => player.id);

    void persistStartedGame(game, playerIds).catch((error) => {
      logPersistenceError("start", game.id, error);
    });
  });

  game.instance.on(GameOutEvents.GAME_OVER, (event) => {
    persistCurrentFinishedGame(game, event.payload.winner.id);
  });

  const snapshot = game.instance.getSnapshot();
  if (snapshot.matches(GameStates.GAME_OVER)) {
    const winner = snapshot.context.players.find((player) => player.isAlive);
    if (winner) persistCurrentFinishedGame(game, winner.id);
  }
}
