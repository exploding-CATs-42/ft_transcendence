import { assign, emit, setup } from "xstate";
import {
  GameActionType,
  addPlayer,
  addPlayerConfirmation,
  removePlayer,
  removePlayerConfirmation,
} from "./actions";
import { Player } from "./types/player";
import { GameEvent, GameEventType } from "./events";
import { GameGuardType, hasEnoughPlayers } from "./guards";
import { START_GAME_COUNTDOWN_MS } from "../constants/game";
import {
  countdownCanceled,
  countdownStarted,
  GameEmitter,
  gameStarted,
} from "./emitters";
import { GAME_MACHINE_ID, GameStatePath, GameStateType } from "./states";

export interface GameContext {
  players: Player[];
}

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
    emitted: {} as GameEmitter,
  },
  actions: {
    [GameActionType.ADD_PLAYER]: assign(addPlayer),
    [GameActionType.REMOVE_PLAYER]: assign(removePlayer),
    [GameActionType.ADD_PLAYER_CONFIRMATION]: assign(addPlayerConfirmation),
    [GameActionType.REMOVE_PLAYER_CONFIRMATION]: assign(
      removePlayerConfirmation,
    ),
  },
  guards: {
    [GameGuardType.HAS_ENOUGH_PLAYERS]: hasEnoughPlayers,
  },
}).createMachine({
  id: GAME_MACHINE_ID,
  initial: GameStateType.WAITING,
  context: () => ({
    players: [],
  }),
  states: {
    [GameStateType.WAITING]: {
      initial: GameStateType.WAITING_CONFIRMING,
      states: {
        [GameStateType.WAITING_CONFIRMING]: {
          always: {
            guard: GameGuardType.HAS_ENOUGH_PLAYERS,
            target: GameStatePath.WAITING_STARTING,
          },
          on: {
            [GameEventType.JOIN_GAME]: {
              actions: GameActionType.ADD_PLAYER,
            },
            [GameEventType.LEAVE_GAME]: {
              actions: GameActionType.REMOVE_PLAYER,
            },
            [GameEventType.CONFIRM_START]: {
              actions: GameActionType.ADD_PLAYER_CONFIRMATION,
            },
            [GameEventType.CANCEL_START]: {
              actions: GameActionType.REMOVE_PLAYER_CONFIRMATION,
            },
          },
        },
        [GameStateType.WAITING_STARTING]: {
          entry: emit(countdownStarted),
          after: {
            [START_GAME_COUNTDOWN_MS]: {
              target: GameStatePath.PLAYING,
            },
          },
          on: {
            [GameEventType.JOIN_GAME]: {
              target: GameStatePath.WAITING_CONFIRMING,
              actions: [GameActionType.ADD_PLAYER, emit(countdownCanceled)],
            },
            [GameEventType.LEAVE_GAME]: {
              target: GameStatePath.WAITING_CONFIRMING,
              actions: [GameActionType.REMOVE_PLAYER, emit(countdownCanceled)],
            },
            [GameEventType.CANCEL_START]: {
              target: GameStatePath.WAITING_CONFIRMING,
              actions: [
                GameActionType.REMOVE_PLAYER_CONFIRMATION,
                emit(countdownCanceled),
              ],
            },
          },
        },
      },
    },
    [GameStateType.PLAYING]: {
      entry: emit(gameStarted),
    },
  },
});
