import { setup } from "xstate";
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
  actions: {},
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
      },
    },
    playing: {},
  },
});
