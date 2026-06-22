// Local level
import type { PlayerContext } from "./playerMachine";
import {
  type PlayerEvent,
  type PlayerOutEvent,
  PlayerOutEvents,
} from "./events";

type PlayerEmitterArgs = {
  context: PlayerContext;
  event: PlayerEvent;
};

export const readinessConfirmed = ({
  context: _,
  event,
}: PlayerEmitterArgs): PlayerOutEvent => {
  return {
    type: PlayerOutEvents.READINESS_CONFIRMED,
    playerId: event.playerId,
  };
};

export const readinessCanceled = ({
  context: _,
  event,
}: PlayerEmitterArgs): PlayerOutEvent => {
  return {
    type: PlayerOutEvents.READINESS_CANCELED,
    playerId: event.playerId,
  };
};

/* emitter - is a function that emits an "event" object to the "outside world",
 * giving it it's type and optional payload.
 * it takes as a parameter an object, containing machine context,
 * and an event that triggered the emission
 */
