// playerMachine.ts
import { setup, sendParent } from "xstate";

export const playerMachine = setup({
  types: {
    context: {} as {
      playerId: string;
    },
    input: {} as {
      playerId: string;
    },
    events: {} as {
      type: "CONFIRM_READINESS";
    },
  },
}).createMachine({
  context: ({ input }) => ({
    playerId: input.playerId,
  }),

  initial: "notReady",

  states: {
    notReady: {
      on: {
        CONFIRM_READINESS: {
          target: "ready",
          actions: sendParent(({ context }) => ({
            type: "READINESS_CONFIRMED",
            playerId: context.playerId,
          })),
        },
      },
    },

    ready: {},
  },
});
