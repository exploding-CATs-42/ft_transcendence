// Local level
import { START_GAME_COUNTDOWN_MS } from "./constants";
import { GameOutEvent, GameOutEvents } from "./events";

export const countdownStarted = (): GameOutEvent => ({
  type: GameOutEvents.COUNTDOWN_STARTED,
  endsAt: Date.now() + START_GAME_COUNTDOWN_MS,
});

export const countdownCanceled = (): GameOutEvent => ({
  type: GameOutEvents.COUNTDOWN_CANCELED,
});

export const gameStarted = (): GameOutEvent => ({
  type: GameOutEvents.GAME_STARTED,
});
