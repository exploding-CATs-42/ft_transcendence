import { setup, sendParent } from 'xstate';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlayerInput {
  playerId: string;
}

export interface PlayerContext {
  playerId: string;
}

export type PlayerEvent = { type: 'CONFIRM_READINESS' };

/** Event sent up to the parent (game machine) when this player becomes ready. */
export type PlayerEmittedToParent = { type: 'PLAYER_READY'; playerId: string };

// ─── Machine ─────────────────────────────────────────────────────────────────

/**
 * Player state machine.
 *
 * States:
 *   not-ready  ──[CONFIRM_READINESS]──►  ready
 *
 * On entering "ready", sends PLAYER_READY to the parent (game machine).
 */
export const playerMachine = setup({
  types: {
    input: {} as PlayerInput,
    context: {} as PlayerContext,
    events: {} as PlayerEvent,
  },
}).createMachine({
  id: 'player',

  // Seed context from input passed at spawn time.
  context: ({ input }) => ({
    playerId: input.playerId,
  }),

  initial: 'not-ready',

  states: {
    'not-ready': {
      on: {
        CONFIRM_READINESS: {
          target: 'ready',
        },
      },
    },

    ready: {
      entry: sendParent(
        ({ context }): PlayerEmittedToParent => ({
          type: 'PLAYER_READY',
          playerId: context.playerId,
        }),
      ),
    },
  },
});
