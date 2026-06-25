// Libraries
import { setup, assign } from "xstate";
// Local level
import type { PlayerContext } from "./context";
import { PlayerActions } from "./actions";
import { PlayerGuards } from "./guards";
import { machineId } from "./constants";
import { PlayerStates } from "./states";
import { PlayerTargets } from "./targets";
import { PlayerEvents } from "./events";

export const playerMachine = setup({
  types: {
    context: {} as PlayerContext,
    input: {} as PlayerContext,
  },
  actions: {
    // placeholders, overridden via .provide()
    [PlayerActions.ADD_CARD]: assign(() => ({})),
  },
  guards: {
    // placeholders, overridden via .provide()
    [PlayerGuards.HAS_CARDS]: () => false,
  },
}).createMachine({
  id: machineId,
  context: ({ input }) => input,
  initial: PlayerStates.IN_LOBBY,
  states: {
    [PlayerStates.IN_LOBBY]: {
      initial: PlayerStates.NOT_READY,
      states: {
        [PlayerStates.NOT_READY]: {
          on: {
            [PlayerEvents.CONFIRM_READINESS]: {
              target: PlayerTargets.READY,
            },
          },
        },
        [PlayerStates.READY]: {
          on: {
            [PlayerEvents.CANCEL_READINESS]: {
              target: PlayerTargets.NOT_READY,
            },
            [PlayerEvents.GAME_STARTED]: {
              target: PlayerTargets.IN_GAME,
            },
          },
        },
      },
    },
    [PlayerStates.IN_GAME]: {},
    [PlayerStates.AFTER_GAME]: { type: "final" },
  },
});
