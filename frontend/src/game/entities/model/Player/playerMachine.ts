// Libraries
import { setup } from "xstate";
// Local level
import type { PlayerContext } from "./context";
import { PlayerGuards } from "./guards";
import { machineId } from "./constants";

export const playerMachine = setup({
  types: {
    context: {} as PlayerContext,
    input: {} as PlayerContext,
  },
  guards: {
    // placeholders, overridden via .provide()
    [PlayerGuards.HAS_CARDS]: () => false,
  },
}).createMachine({
  id: machineId,
  context: ({ input }) => input,
});
