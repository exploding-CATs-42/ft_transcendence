import { setup, assign, sendTo, emit } from "xstate";
import type { ActorRefFrom } from "xstate";
import { playerMachine } from "./playerMachine";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GameContext {
  /** Map of playerId → spawned player actor reference. */
  players: Record<string, ActorRefFrom<typeof playerMachine>>;
}

export type GameEvent =
  /** A new player joins; the game machine spawns a player actor for them. */
  | { type: "PLAYER_JOINED"; playerId: string }
  /** Forwarded to the matching player actor, which transitions to "ready". */
  | { type: "CONFIRM_READINESS"; playerId: string }
  /** Moves the game from lobby → in-game. */
  | { type: "START_GAME" }
  /** Internal: sent up by a child player actor when it reaches "ready". */
  | { type: "PLAYER_READY"; playerId: string };

/** Event emitted outward via gameActor.on('READINESS_CONFIRMED', …). */
export type GameEmitted = { type: "READINESS_CONFIRMED"; playerId: string };

// ─── Machine ─────────────────────────────────────────────────────────────────

/**
 * Game state machine.
 *
 * States:
 *   lobby  ──[START_GAME]──►  in-game
 *
 * All communication with the outside world passes through this machine.
 *
 * External events in:
 *   PLAYER_JOINED      — spawns a new player actor
 *   CONFIRM_READINESS  — forwarded to the right player actor
 *   START_GAME         — transitions to in-game
 *
 * Internal events in (from child player actors):
 *   PLAYER_READY       — triggers emission of READINESS_CONFIRMED
 *
 * Events emitted out (listen with gameActor.on('READINESS_CONFIRMED', …)):
 *   READINESS_CONFIRMED { playerId }
 */
export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
    emitted: {} as GameEmitted,
  },

  actors: {
    playerMachine,
  },

  actions: {
    /**
     * Spawn a new player actor and store its ref in context keyed by playerId.
     * Uses the `spawn` helper injected into the assign callback by XState v5.
     */
    spawnPlayer: assign({
      players: ({ context, event, spawn }) => {
        if (event.type !== "PLAYER_JOINED") return context.players;

        const { playerId } = event;
        const playerRef = spawn("playerMachine", {
          id: `player-${playerId}`,
          input: { playerId },
        });

        return { ...context.players, [playerId]: playerRef };
      },
    }),

    /**
     * Forward CONFIRM_READINESS to the player actor identified by
     * event.playerId.
     */
    forwardReadinessToPlayer: sendTo(
      ({ context, event }) => {
        if (event.type !== "CONFIRM_READINESS") {
          throw new Error(
            `forwardReadinessToPlayer called with unexpected event: ${event.type}`,
          );
        }
        const ref = context.players[event.playerId];
        if (!ref) {
          throw new Error(`No player actor found for id: ${event.playerId}`);
        }
        return ref;
      },
      { type: "CONFIRM_READINESS" } as const,
    ),

    /**
     * Emit READINESS_CONFIRMED to any external listeners.
     * External code subscribes with: gameActor.on('READINESS_CONFIRMED', cb)
     */
    emitReadinessConfirmed: emit(({ event }): GameEmitted => {
      if (event.type !== "PLAYER_READY") {
        throw new Error(
          `emitReadinessConfirmed called with unexpected event: ${event.type}`,
        );
      }
      return { type: "READINESS_CONFIRMED", playerId: event.playerId };
    }),
  },
}).createMachine({
  id: "game",

  context: {
    players: {},
  },

  initial: "lobby",

  states: {
    lobby: {
      on: {
        PLAYER_JOINED: {
          actions: "spawnPlayer",
        },

        CONFIRM_READINESS: {
          actions: "forwardReadinessToPlayer",
        },

        // Received from a child player actor via sendParent.
        PLAYER_READY: {
          actions: "emitReadinessConfirmed",
        },

        START_GAME: {
          target: "in-game",
        },
      },
    },

    "in-game": {
      on: {
        // Players can still join after the game starts.
        PLAYER_JOINED: {
          actions: "spawnPlayer",
        },

        // Still support readiness confirmations after game starts.
        CONFIRM_READINESS: {
          actions: "forwardReadinessToPlayer",
        },

        PLAYER_READY: {
          actions: "emitReadinessConfirmed",
        },
      },
    },
  },
});
