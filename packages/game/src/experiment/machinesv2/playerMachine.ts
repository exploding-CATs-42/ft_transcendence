import { setup, emit } from 'xstate';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlayerInput {
  playerId: string;
}

export interface PlayerContext {
  playerId: string;
}

export type PlayerEvent = { type: 'CONFIRM_READINESS' };

/**
 * Events the player machine emits outward (observable via playerRef.on(…)).
 * The machine no longer uses sendParent — it is fully decoupled from its parent.
 */
export type PlayerEmitted = { type: 'READINESS_CONFIRMED'; playerId: string };

// ─── Machine ─────────────────────────────────────────────────────────────────

/**
 * Player state machine.
 *
 * States:
 *   not-ready  ──[CONFIRM_READINESS]──►  ready
 *
 * On entering "ready", emits READINESS_CONFIRMED outward instead of calling
 * sendParent. The game machine subscribes to this emission after spawning.
 */
export const playerMachine = setup({
  types: {
    input:   {} as PlayerInput,
    context: {} as PlayerContext,
    events:  {} as PlayerEvent,
    emitted: {} as PlayerEmitted,
  },
}).createMachine({
  id: 'player',

  context: ({ input }) => ({
    playerId: input.playerId,
  }),

  initial: 'not-ready',

  states: {
    'not-ready': {
      on: {
        CONFIRM_READINESS: { target: 'ready' },
      },
    },

    ready: {
      // Emit outward — no knowledge of any parent whatsoever.
      entry: emit(({ context }): PlayerEmitted => ({
        type: 'READINESS_CONFIRMED',
        playerId: context.playerId,
      })),
    },
  },
});
