import { assign, setup, sendTo, emit } from "xstate";
import { createActor } from "xstate";

// Player Machine
const playerMachine = setup({
  types: {
    context: {} as { playerId: string },
    events: {} as { type: "CONFIRM_READINESS"; playerId: string },
    emitted: {} as { type: "READINESS_CONFIRMED"; playerId: string },
    input: {} as { playerId: string },
  },
}).createMachine({
  id: "player",
  initial: "not-ready",
  context: ({ input }) => ({
    playerId: input.playerId,
  }),
  states: {
    ready: {
      on: {
        CONFIRM_READINESS: {
          actions: emit(({ context }) => ({
            type: "READINESS_CONFIRMED",
            playerId: context.playerId,
          })),
        },
      },
    },
    "not-ready": {
      on: {
        CONFIRM_READINESS: {
          target: "ready",
          actions: emit(({ context }) => ({
            type: "READINESS_CONFIRMED",
            playerId: context.playerId,
          })),
        },
      },
    },
  },
});

// Game Machine
interface PlayerActor {
  ref: any; // Actor ref
  id: string;
}

const gameMachine = setup({
  types: {
    context: {} as {
      players: PlayerActor[];
      playerCount: number;
    },
    events: {} as
      | { type: "PLAYER_JOINED"; playerId: string }
      | { type: "CONFIRM_READINESS"; playerId: string }
      | { type: "START_GAME" },
  },
  actions: {
    spawnPlayer: assign({
      players: ({ context, event, spawn }) => {
        if (event.type !== "PLAYER_JOINED") return context.players;

        // Create a new player actor
        const playerActor = spawn(playerMachine, {
          input: { playerId: event.playerId },
          id: `player-${event.playerId}`,
        });

        return [...context.players, { ref: playerActor, id: event.playerId }];
      },
      playerCount: ({ context }) => context.players.length + 1,
    }),
    forwardReadiness: sendTo(
      ({ event, context }) => {
        if (event.type !== "CONFIRM_READINESS") return "";
        const player = context.players.find((p) => p.id === event.playerId);
        return player?.ref ?? "";
      },
      ({ event }) => ({
        type: "CONFIRM_READINESS" as const,
        playerId: event.playerId,
      }),
    ),
  },
}).createMachine({
  id: "game",
  initial: "lobby",
  context: {
    players: [],
    playerCount: 0,
  },
  states: {
    lobby: {
      on: {
        PLAYER_JOINED: {
          actions: "spawnPlayer",
        },
        CONFIRM_READINESS: {
          actions: "forwardReadiness",
        },
        START_GAME: {
          target: "in-game",
          guard: ({ context }) => {
            // Check if all players are ready
            return context.players.length > 0;
          },
        },
      },
    },
    "in-game": {
      type: "final",
    },
  },
});

// Usage simulation
const gameActor = createActor(gameMachine);

// Listen for all events from the game actor
gameActor.subscribe((snapshot) => {
  console.log("Game state:", snapshot.value);
  console.log("Players:", snapshot.context.players.length);

  // Listen for emitted events from spawned actors
  const children = Object.values(snapshot.children);
  children.forEach((child) => {
    const childSnapshot = child.getSnapshot();
    if (childSnapshot.value === "ready") {
      console.log(`Player ${childSnapshot.context.playerId} is ready`);
    }
  });
});

// Start the game actor
gameActor.start();

// Simulate players joining
console.log("Player 1 joining...");
gameActor.send({ type: "PLAYER_JOINED", playerId: "player1" });

console.log("Player 2 joining...");
gameActor.send({ type: "PLAYER_JOINED", playerId: "player2" });

// Confirm readiness
console.log("Player 1 confirming readiness...");
gameActor.send({ type: "CONFIRM_READINESS", playerId: "player1" });

console.log("Player 2 confirming readiness...");
gameActor.send({ type: "CONFIRM_READINESS", playerId: "player2" });

// Try to start the game
console.log("Starting game...");
gameActor.send({ type: "START_GAME" });
