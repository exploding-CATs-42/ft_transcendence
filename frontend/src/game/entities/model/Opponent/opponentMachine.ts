// Libraries
import { setup, emit } from "xstate";
// Local level
import type { OpponentContext } from "./context";
import actions, { OpponentActions } from "./actions";
import guards, { OpponentGuards } from "./guards";
import { machineId } from "./constants";
import { OpponentStates } from "./states";
import { OpponentTargets } from "./targets";
import {
  type OpponentEvent,
  type OpponentOutEvent,
  OpponentEvents,
} from "./events";
import { exploded } from "./emitters";

export const opponentMachine = setup({
  types: {
    context: {} as OpponentContext,
    events: {} as OpponentEvent,
    emitted: {} as OpponentOutEvent,
  },
  actions: actions,
  guards: guards,
}).createMachine({
  id: machineId,
  context: { cardCount: 0, turnCount: 0 },
  initial: OpponentStates.IN_LOBBY,
  states: {
    [OpponentStates.IN_LOBBY]: {
      initial: OpponentStates.NOT_READY,
      states: {
        [OpponentStates.NOT_READY]: {
          on: {
            [OpponentEvents.CONFIRM_READINESS]: {
              target: OpponentTargets.READY,
            },
          },
        },
        [OpponentStates.READY]: {
          on: {
            [OpponentEvents.CANCEL_READINESS]: {
              target: OpponentTargets.NOT_READY,
            },
            [OpponentEvents.GAME_STARTED]: {
              target: OpponentTargets.IN_GAME,
            },
          },
        },
      },
    },
    [OpponentStates.IN_GAME]: {
      initial: OpponentStates.ALIVE,
      states: {
        [OpponentStates.ALIVE]: {
          initial: OpponentStates.WAITING_FOR_TURN,
          states: {
            [OpponentStates.WAITING_FOR_TURN]: {
              on: {
                [OpponentEvents.START_TURN]: {
                  target: OpponentTargets.MAKING_TURN,
                },
                [OpponentEvents.GIVE_CARD]: {
                  guard: OpponentGuards.HAS_CARD,
                  actions: OpponentActions.REMOVE_CARD,
                },
                [OpponentEvents.GIVE_ANY_CARD]: {
                  guard: OpponentGuards.HAS_CARDS,
                  actions: OpponentActions.REMOVE_CARD,
                },
              },
            },
            [OpponentStates.MAKING_TURN]: {
              initial: OpponentStates.NORMAL,
              states: {
                [OpponentStates.NORMAL]: {
                  on: {
                    [OpponentEvents.GET_ATTACKED]: {
                      actions: OpponentActions.INCREASE_TURN_COUNT,
                      target: OpponentTargets.UNDER_ATTACK,
                    },
                  },
                },
                [OpponentStates.UNDER_ATTACK]: {
                  on: {
                    [OpponentEvents.TURN_COUNT_CHANGED]: {
                      guard: OpponentGuards.HAS_ONE_TURN_LEFT,
                      target: OpponentTargets.NORMAL,
                    },
                  },
                },
              },
              on: {
                [OpponentEvents.END_TURN]: {
                  actions: OpponentActions.DECREASE_TURN_COUNT,
                  target: OpponentTargets.WAITING_FOR_TURN,
                },
                [OpponentEvents.EXPLODE]: {
                  target: OpponentTargets.DEAD,
                },
                [OpponentEvents.PLAY_CARD]: {
                  guard: OpponentGuards.HAS_CARD,
                  actions: OpponentActions.REMOVE_CARD,
                },
                [OpponentEvents.DRAW_CARD]: {
                  actions: [
                    OpponentActions.ADD_CARD,
                    OpponentActions.DECREASE_TURN_COUNT,
                  ],
                },
                [OpponentEvents.TAKE_CARD]: {
                  actions: OpponentActions.ADD_CARD,
                },
              },
            },
          },
        },
        [OpponentStates.DEAD]: { type: "final", entry: emit(exploded) },
      },
      on: {
        [OpponentEvents.GAME_ENDED]: {
          target: OpponentTargets.AFTER_GAME,
        },
      },
    },
    [OpponentStates.AFTER_GAME]: { type: "final" },
  },
});
