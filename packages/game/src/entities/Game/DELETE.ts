import { setup, sendTo, ActorRef } from "xstate";

// Types for events the parent accepts
type ParentEvent = { type: "PLAYER_SCORE_UPDATED"; id: string; score: number };

export const playerMachine = setup({
  types: {
    // Expect the parent's actor ref inside input and context
    input: {} as { id: string; parentRef: ActorRef<any, ParentEvent> },
    context: {} as {
      id: string;
      score: number;
      parentRef: ActorRef<any, ParentEvent>;
    },
    events: {} as { type: "GAIN_POINTS"; points: number } | { type: "RESET" },
  },
}).createMachine({
  id: "player",
  context: ({ input }) => ({
    id: input.id,
    score: 0,
    parentRef: input.parentRef, // Store the parent reference
  }),
  initial: "active",
  states: {
    active: {
      on: {
        GAIN_POINTS: {
          actions: [
            // 1. Update internal state
            ({ context, event }) => {
              context.score += event.points;
            },
            // 2. Report the data back to the parent
            sendTo(
              ({ context }) => context.parentRef,
              ({ context }) => ({
                type: "PLAYER_SCORE_UPDATED",
                id: context.id,
                score: context.score,
              }),
            ),
          ],
        },
        RESET: {
          actions: ({ context }) => {
            context.score = 0;
          },
        },
      },
    },
  },
});
