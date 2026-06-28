// Local level
import { START_GAME_COUNTDOWN_MS } from "./constants";
import { GameContext } from "./context";
import {
  GameEvent,
  GameEvents,
  type GameOutEvent,
  GameOutEvents,
} from "./events";

type GameEmitterArgs = {
  context: GameContext;
  event: GameEvent;
};

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

export const playerConfirmedReadiness = ({
  event,
}: GameEmitterArgs): GameOutEvent => {
  if (event.type !== GameEvents.PLAYER_CONFIRMED_READINESS) throw Error;
  return { type: GameOutEvents.READINESS_CONFIRMED, playerId: event.playerId };
};

/* emitter - is a function that emits an "event" object to the "outside world",
 * giving it it's type and optional payload.
 * it takes as a parameter an object, containing machine context,
 * and an event that triggered the emission
 */
