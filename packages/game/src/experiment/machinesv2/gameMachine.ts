import { setup, assign, sendTo, emit } from "xstate";
import type { ActorRefFrom, AnyActorRef } from "xstate";
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
  /**
   * Internal: re-sent to self by the player subscription bridge when a player
   * emits READINESS_CONFIRMED. Keeps all state logic inside the machine.
   */
  | { type: "PLAYER_CONFIRMED_READINESS"; playerId: string };

/** Event emitted outward via gameActor.on('READINESS_CONFIRMED', …). */
export type GameEmitted = { type: "READINESS_CONFIRMED"; playerId: string };

// ─── Player event bridge ─────────────────────────────────────────────────────

/**
 * Subscribes to all emitted events from a player actor and re-sends them to
 * the game actor as internal game events.
 *
 * This is the single place that maps player-out-events → game-in-events.
 * Adding a new player emission in the future means adding one more `.on()`
 * call here — nothing else needs to change.
 */
export const subscribeToPlayerEvents = (
  player: ActorRefFrom<typeof playerMachine>,
  game: AnyActorRef,
): void => {
  player.on("READINESS_CONFIRMED", ({ playerId }) => {
    game.send({ type: "PLAYER_CONFIRMED_READINESS", playerId });
  });

  // Every future player-emitted event goes here, in one place.
};

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
 *   PLAYER_JOINED                — spawns a player actor and wires its events
 *   CONFIRM_READINESS            — forwarded to the right player actor
 *   START_GAME                   — transitions to in-game
 *
 * Internal events in (via subscribeToPlayerEvents bridge):
 *   PLAYER_CONFIRMED_READINESS   — triggers emission of READINESS_CONFIRMED
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
     * Spawn a new player actor, store its ref in context, then immediately
     * wire up the event bridge using `self` — the game actor's own ref.
     *
     * `self` is injected by XState alongside `spawn` in the assign callback,
     * giving us a stable reference to send events back to this machine.
     */
    spawnPlayer: assign({
      players: ({ context, event, spawn, self }) => {
        if (event.type !== "PLAYER_JOINED") return context.players;

        const { playerId } = event;
        const playerRef = spawn("playerMachine", {
          id: `player-${playerId}`,
          input: { playerId },
        });

        // Wire player emissions → game events, using self as the target.
        subscribeToPlayerEvents(playerRef, self);

        return { ...context.players, [playerId]: playerRef };
      },
    }),

    /** Forward CONFIRM_READINESS to the correct player actor. */
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

    /** Emit READINESS_CONFIRMED outward to external listeners. */
    emitReadinessConfirmed: emit(({ event }): GameEmitted => {
      if (event.type !== "PLAYER_CONFIRMED_READINESS") {
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

        // Arrives via the subscribeToPlayerEvents bridge.
        PLAYER_CONFIRMED_READINESS: {
          actions: "emitReadinessConfirmed",
        },

        START_GAME: {
          target: "in-game",
        },
      },
    },

    "in-game": {
      on: {
        PLAYER_JOINED: {
          actions: "spawnPlayer",
        },

        CONFIRM_READINESS: {
          actions: "forwardReadinessToPlayer",
        },

        PLAYER_CONFIRMED_READINESS: {
          actions: "emitReadinessConfirmed",
        },
      },
    },
  },
});
