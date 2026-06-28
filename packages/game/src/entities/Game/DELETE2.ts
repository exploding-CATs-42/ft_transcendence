import { setup, assign, sendTo, ActorRefFrom } from "xstate";
import { playerMachine } from "../Player";

const gameSetup = setup({
  types: {
    context: {} as {
      players: Array<{
        id: string;
        ref: ActorRefFrom<typeof playerMachine>;
      }>;
      totalTeamScore: number;
    },
    events: {} as
      | { type: "SPAWN_PLAYER"; id: string }
      | { type: "PLAYER_SCORE_UPDATED"; id: string; score: number }
      | { type: "BUFF_ALL_PLAYERS" },
  },
});

export const spawnPlayer = gameSetup.assign({
  players: ({ context, event, self, spawn }) => {
    if (event.type !== "SPAWN_PLAYER") return context.players;

    const newPlayerRef = spawn(playerMachine, {
      input: {
        id: event.id,
        parentRef: self,
      },
    });

    return [...context.players, { id: event.id, ref: newPlayerRef }];
  },
});

export const gameMachine = gameSetup.createMachine({
  id: "gameLobby",
  context: {
    players: [],
    totalTeamScore: 0,
  },
  initial: "playing",
  states: {
    playing: {
      on: {
        // Spawning a child and establishing 2-way link
        SPAWN_PLAYER: {
          actions: assign({
            players: ({ context, event, self, spawn }) => {
              // Create the dynamic child actor
              const newPlayerRef = spawn(playerMachine, {
                input: {
                  id: event.id,
                  parentRef: self, // Pass parent ref to child for 2-way communication!
                },
              });

              return [...context.players, { id: event.id, ref: newPlayerRef }];
            },
          }),
        },

        // Receiving data FROM a child
        PLAYER_SCORE_UPDATED: {
          actions: assign({
            totalTeamScore: ({ context }) => {
              // You can even read child snapshots directly if needed,
              // but relying on the event payload is safer and cleaner!
              return context.players.reduce(
                (sum, p) => sum + p.ref.getSnapshot().context.score,
                0,
              );
            },
          }),
        },

        // Sending data TO all children (Broadcasting)
        BUFF_ALL_PLAYERS: {
          actions: ({ context }) => {
            context.players.forEach((player) => {
              // target individual child references
              sendTo(player.ref, { type: "GAIN_POINTS", points: 10 });
            });
          },
        },
      },
    },
  },
});
