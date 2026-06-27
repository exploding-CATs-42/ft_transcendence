// Libraries
import { setup } from "xstate";
// Local level
import type { PlayerContext } from "./context";
import { machineId } from "./constants";
import { PlayerStates } from "./states";
import { PlayerTargets } from "./targets";
import { type PlayerEvent, type PlayerOutEvent, PlayerEvents } from "./events";

export const playerMachine = setup({
  types: {
    context: {} as PlayerContext,
    events: {} as PlayerEvent,
    emitted: {} as PlayerOutEvent,
  },
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
      on: { [PlayerEvents.GAME_ENDED]: { target: PlayerTargets.AFTER_GAME } },
    },
    [PlayerStates.AFTER_GAME]: { type: "final" },
  },
});
