import { type PlayerOutEvent, PlayerOutEvents } from "./events";

/* Emitter - is a function that emits an "event" object to the "outside world",
 * giving it it's type and optional payload.
 * it takes as a parameter an object, containing:
 * - machine context,
 * - and an event that triggered the emission
 */

export const exploded = (): PlayerOutEvent => {
  return {
    type: PlayerOutEvents.EXPLODED,
  };
};
