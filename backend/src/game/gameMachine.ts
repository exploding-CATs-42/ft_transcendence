// Libraries
import { assign, emit, setup } from "xstate";
// Local level
import { START_GAME_COUNTDOWN_MS } from "./constants";
import {
  GameActions,
  addPlayer,
  addPlayerConfirmation,
  fillDeck,
  removePlayer,
  removePlayerConfirmation,
} from "./actions";
import { Player, Deck } from "./types";
import { GameEvent, GameEvents } from "./events";
import { GameGuards, hasEnoughPlayers } from "./guards";
import {
  countdownCanceled,
  countdownStarted,
  GameEmitter,
  gameStarted,
} from "./emitters";
import { GAME_MACHINE_ID, GameStates } from "./states";
import { GameTargets } from "./targets";

export interface GameContext {
  players: Player[];
  deck: Deck;
}

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
    emitted: {} as GameEmitter,
  },
  actions: {
    [GameActions.ADD_PLAYER]: assign(addPlayer),
    [GameActions.REMOVE_PLAYER]: assign(removePlayer),
    [GameActions.ADD_PLAYER_CONFIRMATION]: assign(addPlayerConfirmation),
    [GameActions.REMOVE_PLAYER_CONFIRMATION]: assign(removePlayerConfirmation),
    [GameActions.FILL_DECK]: assign(fillDeck),
  },
  guards: {
    [GameGuards.HAS_ENOUGH_PLAYERS]: hasEnoughPlayers,
  },
}).createMachine({
  id: GAME_MACHINE_ID,
  initial: GameStates.WAITING,
  context: () => ({
    players: [],
    deck: [],
  }),
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
              actions: GameActions.ADD_PLAYER,
            },
            [GameEvents.LEAVE_GAME]: {
              actions: GameActions.REMOVE_PLAYER,
            },
            [GameEvents.CONFIRM_START]: {
              actions: GameActions.ADD_PLAYER_CONFIRMATION,
            },
            [GameEvents.CANCEL_START]: {
              actions: GameActions.REMOVE_PLAYER_CONFIRMATION,
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
              target: GameTargets.WAITING_CONFIRMING,
              actions: [GameActions.ADD_PLAYER, emit(countdownCanceled)],
            },
            [GameEvents.LEAVE_GAME]: {
              target: GameTargets.WAITING_CONFIRMING,
              actions: [GameActions.REMOVE_PLAYER, emit(countdownCanceled)],
            },
            [GameEvents.CANCEL_START]: {
              target: GameTargets.WAITING_CONFIRMING,
              actions: [
                GameActions.REMOVE_PLAYER_CONFIRMATION,
                emit(countdownCanceled),
              ],
            },
          },
        },
      },
    },
    [GameStates.PLAYING]: {
      entry: emit(gameStarted),
      initial: GameStates.DEALING_CARDS,
      states: {
        [GameStates.DEALING_CARDS]: {
          entry: GameActions.FILL_DECK,
        },
      },
    },
  },
});
