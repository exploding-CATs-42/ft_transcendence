// Libraries
import { emit, setup } from "xstate";
// Local level
import { OpponentStates } from "./states";
import {
  type OpponentEvent,
  type OpponentOutEvent,
  OpponentEvents,
} from "./events";
import { exploded } from "./emitters";

export type OpponentContext = object;

export const gameMachine = setup({
  types: {
    context: {} as OpponentContext,
    events: {} as OpponentEvent,
    emitted: {} as OpponentOutEvent,
  },
}).createMachine({
  id: "Opponent",
  initial: OpponentStates.ALIVE,
  context: () => ({
    cards: [],
  }),
  states: {
    [OpponentStates.ALIVE]: {
      on: {
        [OpponentEvents.EXPLODE]: {
          target: OpponentStates.DEAD,
        },
      },
    },
    [OpponentStates.DEAD]: {
      entry: emit(exploded),
      type: "final",
    },
  },
});
