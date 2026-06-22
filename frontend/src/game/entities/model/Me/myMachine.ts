// Libraries
import { emit, setup } from "xstate";
// Local level
import { MyStates } from "./states";
import { type MyEvent, type MyOutEvent, MyEvents } from "./events";
import { exploded } from "./emitters";

export type MyContext = object;

export const gameMachine = setup({
  types: {
    context: {} as MyContext,
    events: {} as MyEvent,
    emitted: {} as MyOutEvent,
  },
}).createMachine({
  id: "My",
  initial: MyStates.ALIVE,
  context: () => ({
    cards: [],
  }),
  states: {
    [MyStates.ALIVE]: {
      on: {
        [MyEvents.EXPLODE]: {
          target: MyStates.DEAD,
        },
      },
    },
    [MyStates.DEAD]: {
      entry: emit(exploded),
      type: "final",
    },
  },
});
