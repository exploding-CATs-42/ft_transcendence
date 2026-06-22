// Libraries
import { emit, setup } from "xstate";
// Local level
import { PlayerStates } from "./states";
import { type PlayerEvent, type PlayerOutEvent, PlayerEvents } from "./events";
import { exploded } from "./emitters";
import type { PlayerContext } from "./context";

export const playerMachine = setup({
  types: {
    context: {} as PlayerContext,
    events: {} as PlayerEvent,
    emitted: {} as PlayerOutEvent,
    input: {} as PlayerContext, // ← input IS the initial context
  },
}).createMachine({
  id: "Player",
  initial: PlayerStates.ALIVE,
  context: ({ input }) => input,
  states: {
    [PlayerStates.ALIVE]: {
      on: {
        [PlayerEvents.EXPLODE]: {
          target: PlayerStates.DEAD,
        },
      },
    },
    [PlayerStates.DEAD]: {
      entry: emit(exploded),
      type: "final",
    },
  },
});
