// Libraries
import { assign, emit, setup } from "xstate";
// Local level
import { GAME_MACHINE_ID, START_GAME_COUNTDOWN_MS } from "./constants";
import {
  GameActions,
  addPlayer,
  addPlayerConfirmation,
  changeTurn,
  shufflePlayers,
  dealCards,
  drawCard,
  fillDeck,
  removePlayer,
  removePlayerConfirmation,
  dropCard,
} from "./actions";
import type { Player, Deck, Card } from "./types";
import { type GameEvent, type GameOutEvent, GameEvents } from "./events";
import { GameGuards, hasEnoughCards, hasEnoughPlayers } from "./guards";
import {
  countdownCanceled,
  countdownStarted,
  gameStarted,
  turnChanged,
} from "./emitters";
import { GameStates } from "./states";
import { GameTargets } from "./targets";

export interface GameContext {
  players: Player[];
  deck: Deck;
  currentTurnPlayerId: string | null;
  lastDrawnCard: Card | null;
  lastPlayedCard: Card | null;
}

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
    emitted: {} as GameOutEvent,
  },
  actions: {
    [GameActions.ADD_PLAYER]: assign(addPlayer),
    [GameActions.REMOVE_PLAYER]: assign(removePlayer),
    [GameActions.ADD_PLAYER_CONFIRMATION]: assign(addPlayerConfirmation),
    [GameActions.REMOVE_PLAYER_CONFIRMATION]: assign(removePlayerConfirmation),
    [GameActions.FILL_DECK]: assign(fillDeck),
    [GameActions.DEAL_CARDS]: assign(dealCards),
    [GameActions.SHUFFLE_PLAYERS]: assign(shufflePlayers),
    [GameActions.CHANGE_TURN]: assign(changeTurn),
    [GameActions.DRAW_CARD]: assign(drawCard),
    [GameActions.DROP_CARD]: assign(dropCard),
  },
  guards: {
    [GameGuards.HAS_ENOUGH_PLAYERS]: hasEnoughPlayers,
    [GameGuards.HAS_ENOUGH_CARDS]: hasEnoughCards,
  },
}).createMachine({
  id: GAME_MACHINE_ID,
  initial: GameStates.WAITING,
  context: () => ({
    players: [],
    deck: [],
    currentTurnPlayerId: null,
    lastDrawnCard: null,
    lastPlayedCard: null,
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
      entry: [
        GameActions.SHUFFLE_PLAYERS,
        GameActions.FILL_DECK,
        GameActions.DEAL_CARDS,
        emit(gameStarted),
      ],
      on: {
        [GameEvents.LEAVE_GAME]: {
          actions: GameActions.REMOVE_PLAYER,
        },
      },
      initial: GameStates.CHANGING_TURN,
      states: {
        [GameStates.CHANGING_TURN]: {
          entry: [GameActions.CHANGE_TURN, emit(turnChanged)],
          always: {
            target: GameTargets.WAITING_FOR_PLAYER_ACTIONS,
          },
        },
        [GameStates.WAITING_FOR_PLAYER_ACTIONS]: {
          on: {
            [GameEvents.DRAW_CARD]: {
              guard: GameGuards.HAS_ENOUGH_CARDS,
              actions: GameActions.DRAW_CARD,
              target: GameStates.CHANGING_TURN,
            },
            [GameEvents.DROP_CARD]: {
              actions: GameActions.DROP_CARD,
            },
          },
        },
      },
    },
  },
});
