// Libraries
import { emit, setup } from "xstate";
// Local level
import { PlayerStates } from "./states";
import { type PlayerEvent, type PlayerOutEvent, PlayerEvents } from "./events";
import { readinessCanceled, readinessConfirmed } from "./emitters";

export type PlayerContext = object;

export const gameMachine = setup({
  types: {
    context: {} as PlayerContext,
    events: {} as PlayerEvent,
    emitted: {} as PlayerOutEvent,
  },
}).createMachine({
  id: "player",
  initial: PlayerStates.IN_LOBBY,
  context: () => ({
    cards: [],
  }),
  states: {
    [PlayerStates.IN_LOBBY]: {
      initial: PlayerStates.IN_LOBBY_READY,
      states: {
        [PlayerStates.IN_LOBBY_READY]: {
          entry: emit(readinessConfirmed),
          on: {
            [PlayerEvents.CANCEL_READINESS]: {
              target: PlayerStates.IN_LOBBY_NOT_READY,
            },
          },
        },
        [PlayerStates.IN_LOBBY_NOT_READY]: {
          entry: emit(readinessCanceled),
          on: {
            [PlayerEvents.CONFIRM_READINESS]: {
              target: PlayerStates.IN_LOBBY_READY,
            },
          },
        },
      },
    },
  },
});
