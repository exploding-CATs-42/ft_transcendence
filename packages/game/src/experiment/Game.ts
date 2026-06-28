import { ActorRefFrom, setup, assign } from "xstate";
import { playerMachine } from "./Player";

type PlayerRef = ActorRefFrom<typeof playerMachine>;

type GameContext = {
  players: Map<string, PlayerRef>;
};

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as
      | {
          type: "PLAYER_JOINED";
          playerId: string;
        }
      | {
          type: "CONFIRM_READINESS";
          playerId: string;
        }
      | {
          type: "READINESS_CONFIRMED";
          playerId: string;
        },
  },
}).createMachine({
  context: {
    players: new Map(),
  },

  initial: "lobby",

  states: {
    lobby: {
      on: {
        PLAYER_JOINED: {
          actions: assign({
            players: ({ context, event, spawn }) => {
              const players = new Map(context.players);

              const actor = spawn(playerMachine);

              players.set(event.playerId, actor);

              return players;
            },
          }),
        },

        CONFIRM_READINESS: {
          actions: ({ context, event }) => {
            const player = context.players.get(event.playerId);

            player?.send({
              type: "CONFIRM_READINESS",
            });
          },
        },

        READINESS_CONFIRMED: {
          actions: ({ event }) => {
            console.log("Outside world:", event.playerId, "is ready");
          },
        },
      },
    },

    inGame: {},
  },
});
