import { assign, setup } from "xstate";
import { addPlayer, removePlayer } from "./actions";
import { Player } from "./types";
import { GameEvent } from "./events";

export interface GameContext {
  players: Player[];
}

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
  actions: {
    addPlayer: assign(addPlayer),
    removePlayer: assign(removePlayer),
  },
}).createMachine({
  id: "game",
  initial: "waiting",
  context: () => ({
    players: [],
  }),
  states: {
    waiting: {
      on: {
        START_GAME: "playing",
        JOIN_GAME: {
          actions: "addPlayer",
        },
        LEAVE_GAME: {
          actions: "removePlayer",
        },
      },
    },
    playing: {},
  },
});
