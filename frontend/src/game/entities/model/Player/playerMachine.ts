// Libraries
import { setup } from "xstate";
// Local level
import type { PlayerContext } from "./context";
import { machineId } from "./constants";

export const playerMachine = setup({
  types: {
    context: {} as PlayerContext,
    input: {} as PlayerContext,
  },
}).createMachine({
  id: machineId,
  context: ({ input }) => input,
});
