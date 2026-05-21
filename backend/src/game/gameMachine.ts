import { setup } from "xstate";
import { Player } from "./types";

export interface GameContext {
  players: Player[];
}

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
  },
  actions: {},
}).createMachine({
  id: "game",
  initial: "waiting",
  context: () => ({
    players: [],
  }),
  states: {
    waiting: {},
    playing: {},
  },
});
