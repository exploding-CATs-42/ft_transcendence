import { setup } from "xstate";

export const gameMachine = setup({
  types: {
    context: {},
  },
  actions: {},
}).createMachine({
  id: "game",
  initial: "waiting",
  states: {
    waiting: {},
    playing: {},
  },
});
