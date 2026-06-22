// Libraries
import { emit, setup, assign } from "xstate";
// Local level
import { PlayerStates } from "./states";
import { type PlayerEvent, type PlayerOutEvent, PlayerEvents } from "./events";
import { type PlayerContext } from "./context";
import { exploded } from "./emitters";
import { PlayerActions } from "./actions";
import { PlayerGuards } from "./guard";

export const playerMachine = setup({
  types: {
    context: {} as PlayerContext,
    events: {} as PlayerEvent,
    emitted: {} as PlayerOutEvent,
    input: {} as PlayerContext,
  },
  actions: {
    // placeholders, overridden via .provide()
    [PlayerActions.PLAY_CARD]: assign(() => ({})),
  },
  guards: {
    // placeholders, overridden via .provide()
    [PlayerGuards.HAS_CARDS]: () => false,
  },
}).createMachine({
  id: "Player",
  initial: PlayerStates.ALIVE,
  context: ({ input }) => input,
  states: {
    [PlayerStates.ALIVE]: {
      on: {
        [PlayerEvents.PLAY_CARD]: {
          guard: PlayerGuards.HAS_CARDS,
          actions: PlayerActions.PLAY_CARD,
        },
        [PlayerEvents.EXPLODE]: {
          target: PlayerStates.DEAD,
        },
      },
    },
    [PlayerStates.DEAD]: {
      type: "final",
      entry: emit(exploded),
    },
  },
});
