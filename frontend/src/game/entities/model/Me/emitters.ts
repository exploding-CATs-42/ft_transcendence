// Local level
import { type MyOutEvent, MyOutEvents } from "./events";

export const exploded = (): MyOutEvent => {
  return {
    type: MyOutEvents.EXPLODED,
  };
};

/* emitter - is a function that emits an "event" object to the "outside world",
 * giving it it's type and optional payload.
 * it takes as a parameter an object, containing machine context,
 * and an event that triggered the emission
 */
