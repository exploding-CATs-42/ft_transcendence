// Libraries
import { emit } from "xstate";
// Local level
import { GAME_MACHINE_ID, START_GAME_COUNTDOWN_MS } from "./constants";
// import { GameActions } from "./actions";
import { GameEvents } from "./events";
import { GameGuards } from "./guards";
import { GameStates } from "./states";
import { GameTargets } from "./targets";
import {
  countdownCanceled,
  countdownStarted,
  playerConfirmedReadiness,
} from "./emitters";
import { gameSetup } from "./setup";

export const gameMachine = gameSetup.createMachine({
  id: GAME_MACHINE_ID,
  context: () => ({
    players: new Map(),
    deck: [],
  }),
  initial: GameStates.WAITING,
  states: {
    [GameStates.WAITING]: {
      initial: GameStates.WAITING_CONFIRMING,
      states: {
        [GameStates.WAITING_CONFIRMING]: {
          always: {
            guard: GameGuards.HAS_ENOUGH_PLAYERS,
            target: GameTargets.WAITING_STARTING,
          },
          on: {
            [GameEvents.JOIN_GAME]: {
              actions: "addPlayer",
            },
          },
        },
        [GameStates.WAITING_STARTING]: {
          entry: emit(countdownStarted),
          after: {
            [START_GAME_COUNTDOWN_MS]: {
              target: GameTargets.PLAYING,
            },
          },
          on: {
            [GameEvents.JOIN_GAME]: {
              actions: ["addPlayer", emit(countdownCanceled)],
              target: GameTargets.WAITING_CONFIRMING,
            },
          },
        },
      },
      on: {
        [GameEvents.PLAYER_CONFIRM_READINESS]: {
          actions: "forwardReadinessToPlayer",
        },
        [GameEvents.PLAYER_CONFIRMED_READINESS]: {
          actions: emit(playerConfirmedReadiness),
        },
      },
    },
    [GameStates.PLAYING]: {},
  },
});
