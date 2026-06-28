// Libraries
import { setup, emit } from "xstate";
// Local level
import type { PlayerContext } from "./context";
import actions, { PlayerActions } from "./actions";
import guards, { PlayerGuards } from "./guards";
import { machineId } from "./constants";
import { PlayerStates } from "./states";
import { PlayerTargets } from "./targets";
import { type PlayerEvent, type PlayerOutEvent, PlayerEvents } from "./events";
import { exploded } from "./emitters";

export const opponentMachine = setup({
  types: {
    context: {} as PlayerContext,
    events: {} as PlayerEvent,
    emitted: {} as PlayerOutEvent,
  },
  actions: actions,
  guards: guards,
}).createMachine({
  id: machineId,
  context: { cards: [], turnCount: 0 },
  initial: PlayerStates.IN_LOBBY,
  states: {
    [PlayerStates.IN_LOBBY]: {
      initial: PlayerStates.NOT_READY,
      states: {
        [PlayerStates.NOT_READY]: {
          on: {
            [PlayerEvents.CONFIRM_READINESS]: {
              target: PlayerTargets.READY,
            },
          },
        },
        [PlayerStates.READY]: {
          on: {
            [PlayerEvents.CANCEL_READINESS]: {
              target: PlayerTargets.NOT_READY,
            },
            [PlayerEvents.GAME_STARTED]: {
              target: PlayerTargets.IN_GAME,
            },
          },
        },
      },
    },
    [PlayerStates.IN_GAME]: {
      initial: PlayerStates.ALIVE,
      states: {
        [PlayerStates.ALIVE]: {
          initial: PlayerStates.WAITING_FOR_TURN,
          states: {
            [PlayerStates.WAITING_FOR_TURN]: {
              on: {
                [PlayerEvents.START_TURN]: {
                  target: PlayerTargets.MAKING_TURN,
                },
                [PlayerEvents.GIVE_CARD]: {
                  guard: PlayerGuards.HAS_CARD,
                  actions: PlayerActions.REMOVE_CARD,
                },
                [PlayerEvents.GIVE_ANY_CARD]: {
                  guard: PlayerGuards.HAS_CARDS,
                  actions: PlayerActions.REMOVE_CARD,
                },
              },
            },
            [PlayerStates.MAKING_TURN]: {
              initial: PlayerStates.NORMAL,
              states: {
                [PlayerStates.NORMAL]: {
                  on: {
                    [PlayerEvents.GET_ATTACKED]: {
                      actions: PlayerActions.INCREASE_TURN_COUNT,
                      target: PlayerTargets.UNDER_ATTACK,
                    },
                  },
                },
                [PlayerStates.UNDER_ATTACK]: {
                  on: {
                    [PlayerEvents.TURN_COUNT_CHANGED]: {
                      guard: PlayerGuards.HAS_ONE_TURN_LEFT,
                      target: PlayerTargets.NORMAL,
                    },
                  },
                },
              },
              on: {
                [PlayerEvents.END_TURN]: {
                  actions: PlayerActions.DECREASE_TURN_COUNT,
                  target: PlayerTargets.WAITING_FOR_TURN,
                },
                [PlayerEvents.EXPLODE]: {
                  target: PlayerTargets.DEAD,
                },
                [PlayerEvents.PLAY_CARD]: {
                  guard: PlayerGuards.HAS_CARD,
                  actions: PlayerActions.REMOVE_CARD,
                },
                [PlayerEvents.DRAW_CARD]: {
                  actions: [
                    PlayerActions.ADD_CARD,
                    PlayerActions.DECREASE_TURN_COUNT,
                  ],
                },
                [PlayerEvents.TAKE_CARD]: {
                  actions: PlayerActions.ADD_CARD,
                },
              },
            },
          },
        },
        [PlayerStates.DEAD]: { type: "final", entry: emit(exploded) },
      },
      on: {
        [PlayerEvents.GAME_ENDED]: {
          target: PlayerTargets.AFTER_GAME,
        },
      },
    },
    [PlayerStates.AFTER_GAME]: { type: "final" },
  },
});
