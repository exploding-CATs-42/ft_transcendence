import { assign, emit, setup } from "xstate";
import {
  GameActionType,
  addPlayer,
  addPlayerConfirmation,
  removePlayer,
  removePlayerConfirmation,
} from "./actions";
import { Player } from "./types/player";
import { GameEvent } from "./events";
import { GameGuardType, hasEnoughPlayers } from "./guards";
import { START_GAME_COUNTDOWN_MS } from "../constants/game";
import {
  countdownCanceled,
  countdownStarted,
  GameEmitter,
  gameStarted,
} from "./emitters";
import { GameStateType } from "./states";

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
  id: "game",
  initial: GameStateType.WAITING,
  context: () => ({
    players: [],
  }),
  states: {
    [GameStateType.WAITING]: {
      initial: "confirming",
      states: {
        [GameStateType.WAITING_CONFIRMING]: {
          always: {
            guard: GameGuardType.HAS_ENOUGH_PLAYERS,
            target: "starting",
          },
          on: {
            JOIN_GAME: {
              actions: GameActionType.ADD_PLAYER,
            },
            LEAVE_GAME: {
              actions: GameActionType.REMOVE_PLAYER,
            },
            CONFIRM_START: {
              actions: GameActionType.ADD_PLAYER_CONFIRMATION,
            },
            CANCEL_START: {
              actions: GameActionType.REMOVE_PLAYER_CONFIRMATION,
            },
          },
        },
        [GameStateType.WAITING_STARTING]: {
          entry: emit(countdownStarted),
          after: {
            [START_GAME_COUNTDOWN_MS]: {
              target: "#game.playing",
            },
          },
          on: {
            JOIN_GAME: {
              target: "#game.waiting.confirming",
              actions: [
                GameActionType.ADD_PLAYER,
                emit({ type: "COUNTDOWN_CANCELED" }),
              ],
            },
            LEAVE_GAME: {
              target: "#game.waiting.confirming",
              actions: [
                GameActionType.REMOVE_PLAYER,
                emit({ type: "COUNTDOWN_CANCELED" }),
              ],
            },
            CANCEL_START: {
              target: "#game.waiting.confirming",
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
