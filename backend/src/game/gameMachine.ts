import { assign, setup } from "xstate";
import { addPlayer } from "./actions";
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
      },
    },
    playing: {},
  },
});
