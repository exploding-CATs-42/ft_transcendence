// Libraries
import { setup, assign } from "xstate";
// Local level
import type { PlayerContext } from "./context";
import { PlayerActions } from "./actions";
import { PlayerGuards } from "./guards";
import { machineId } from "./constants";
import { PlayerStates } from "./states";

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
    [PlayerStates.IN_LOBBY]: {},
    [PlayerStates.IN_GAME]: {},
    [PlayerStates.AFTER_GAME]: {},
  },
});
