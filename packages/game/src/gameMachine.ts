// Libraries
import { and, assign, emit, setup } from "xstate";
// Local level
import {
  GAME_MACHINE_ID,
  START_GAME_COUNTDOWN_MS,
  WAIT_FOR_DEFUSE_TIMEOUT,
  NOPE_WINDOW_MS,
} from "./constants";
import {
  GameActions,
  addPlayer,
  addPlayerConfirmation,
  changeTurn,
  changeTurnUnderAttack,
  shufflePlayers,
  dealCards,
  drawCard,
  fillDeck,
  removePlayer,
  removePlayerConfirmation,
  playCard,
  setCountdownEndsAt,
  clearCountdownEndsAt,
  shuffleDeck,
  skipTurn,
  playCombo,
  setDefuseCountdownEndsAt,
  defuseExplodingKitten,
  explodePlayer,
  insertKitten,
  setNopeWindow,
  clearNopeWindow,
  addNope,
} from "./actions";
import {
  type Player,
  type Deck,
  type Card,
  type NopeWindow,
  CardType,
} from "./types";
import { type GameEvent, type GameOutEvent, GameEvents } from "./events";
import {
  GameGuards,
  hasCardOfType,
  hasDefuseCard,
  hasEnoughPlayers,
  isEnoughCardsInDeck,
  hasExtraTurns,
  isExplodingKittenDrawn,
  isOnlyOnePlayerLeftAlive,
  isPlayersTurn,
  isWindowCardOfType,
  isNoped,
  canPlayNope,
  hasRemainingTurns,
} from "./guards";
import {
  countdownCanceled,
  countdownStarted,
  deckShuffled,
  defusePrompt,
  gameStarted,
  nopeWindowResolved,
  showedTopThreeCards,
  kittenDrawn,
  kittenInserted,
  playerDefused,
  turnChanged,
  turnSkipped,
  playerEliminated,
  gameOver,
} from "./emitters";
import { GameStates } from "./states";
import { GameTargets } from "./targets";

export interface GameContext {
  players: Player[];
  deck: Deck;
  currentTurnPlayerId: string | null;
  lastDrawnCard: Card | null;
  lastPlayedCards: Card[] | null;
  countdownEndsAt: number | null;
  turnsCount: number;
  isUnderAttack: boolean;
  nopeWindow: NopeWindow | null;
  selectedPlayerId: string | null;
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
    [GameActions.CHANGE_TURN_UNDER_ATTACK]: assign(changeTurnUnderAttack),
    [GameActions.DRAW_CARD]: assign(drawCard),
    [GameActions.PLAY_CARD]: assign(playCard),
    [GameActions.SET_COUNTDOWN_ENDS_AT]: assign(setCountdownEndsAt),
    [GameActions.CLEAR_COUNTDOWN_ENDS_AT]: assign(clearCountdownEndsAt),
    [GameActions.SHUFFLE_DECK]: assign(shuffleDeck),
    [GameActions.SKIP_TURN]: assign(skipTurn),
    [GameActions.PLAY_COMBO]: assign(playCombo),
    [GameActions.SET_DEFUSE_COUNTDOWN_ENDS_AT]: assign(
      setDefuseCountdownEndsAt,
    ),
    [GameActions.DEFUSE_KITTEN]: assign(defuseExplodingKitten),
    [GameActions.INSERT_KITTEN]: assign(insertKitten),
    [GameActions.EXPLODE_PLAYER]: assign(explodePlayer),
    [GameActions.SET_NOPE_WINDOW]: assign(setNopeWindow),
    [GameActions.CLEAR_NOPE_WINDOW]: assign(clearNopeWindow),
    [GameActions.ADD_NOPE]: assign(addNope),
  },
  guards: {
    [GameGuards.HAS_ENOUGH_PLAYERS]: hasEnoughPlayers,
    [GameGuards.IS_ENOUGH_CARDS_IN_DECK]: isEnoughCardsInDeck,
    [GameGuards.HAS_CARD_OF_TYPE]: hasCardOfType,
    [GameGuards.IS_WINDOW_CARD_OF_TYPE]: isWindowCardOfType,
    [GameGuards.HAS_EXTRA_TURNS]: hasExtraTurns,
    [GameGuards.HAS_DEFUSE_CARD]: hasDefuseCard,
    [GameGuards.IS_EXPLODING_KITTEN_DRAWN]: isExplodingKittenDrawn,
    [GameGuards.IS_ONLY_ONE_PLAYER_LEFT_ALIVE]: isOnlyOnePlayerLeftAlive,
    [GameGuards.IS_PLAYERS_TURN]: isPlayersTurn,
    [GameGuards.IS_NOPED]: isNoped,
    [GameGuards.CAN_PLAY_NOPE]: canPlayNope,
    [GameGuards.HAS_REMAINING_TURNS]: hasRemainingTurns,
  },
}).createMachine({
  id: GAME_MACHINE_ID,
  initial: GameStates.WAITING,
  context: () => ({
    players: [],
    deck: [],
    currentTurnPlayerId: null,
    lastDrawnCard: null,
    lastPlayedCards: null,
    countdownEndsAt: null,
    turnsCount: 1,
    isUnderAttack: false,
    nopeWindow: null,
    selectedPlayerId: null,
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
          entry: [GameActions.SET_COUNTDOWN_ENDS_AT, emit(countdownStarted)],
          exit: GameActions.CLEAR_COUNTDOWN_ENDS_AT,
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
            [GameEvents.DRAW_CARD]: [
              {
                guard: and([
                  GameGuards.IS_ENOUGH_CARDS_IN_DECK,
                  GameGuards.IS_PLAYERS_TURN,
                ]),
                actions: GameActions.DRAW_CARD,
                target: GameStates.CHECKING_DRAWN_CARD,
              },
            ],
            [GameEvents.PLAY_CARD]: {
              guard: GameGuards.IS_PLAYERS_TURN,
              actions: [GameActions.PLAY_CARD, GameActions.SET_NOPE_WINDOW],
              target: GameStates.WAITING_FOR_NOPES,
            },
            [GameEvents.PLAY_COMBO]: {
              guard: GameGuards.IS_PLAYERS_TURN,
              actions: [GameActions.PLAY_COMBO, GameActions.SET_NOPE_WINDOW],
              target: GameStates.WAITING_FOR_NOPES,
            },
          },
        },
        [GameStates.WAITING_FOR_NOPES]: {
          after: {
            [NOPE_WINDOW_MS]: {
              target: GameStates.RESOLVING_NOPES,
            },
          },
          on: {
            [GameEvents.PLAY_NOPE]: {
              guard: GameGuards.CAN_PLAY_NOPE,
              actions: [GameActions.PLAY_CARD, GameActions.ADD_NOPE],
              target: GameStates.WAITING_FOR_NOPES,
              reenter: true,
            },
          },
        },
        [GameStates.RESOLVING_NOPES]: {
          entry: emit(nopeWindowResolved),
          exit: GameActions.CLEAR_NOPE_WINDOW,
          always: [
            {
              guard: GameGuards.IS_NOPED,
              target: GameStates.WAITING_FOR_PLAYER_ACTIONS,
            },
            {
              guard: {
                type: GameGuards.IS_WINDOW_CARD_OF_TYPE,
                params: { cardType: CardType.ATTACK },
              },
              actions: [
                GameActions.CHANGE_TURN_UNDER_ATTACK,
                emit(turnChanged),
              ],
              target: GameStates.WAITING_FOR_PLAYER_ACTIONS,
            },
            {
              guard: and([
                {
                  type: GameGuards.IS_WINDOW_CARD_OF_TYPE,
                  params: { cardType: CardType.SKIP },
                },
                GameGuards.HAS_EXTRA_TURNS,
              ]),
              actions: [GameActions.SKIP_TURN, emit(turnSkipped)],
              target: GameStates.WAITING_FOR_PLAYER_ACTIONS,
            },
            {
              guard: {
                type: GameGuards.IS_WINDOW_CARD_OF_TYPE,
                params: { cardType: CardType.SKIP },
              },
              actions: [emit(turnSkipped)],
              target: GameStates.CHANGING_TURN,
            },
            {
              guard: {
                type: GameGuards.IS_WINDOW_CARD_OF_TYPE,
                params: { cardType: CardType.SHUFFLE },
              },
              actions: [GameActions.SHUFFLE_DECK, emit(deckShuffled)],
              target: GameStates.WAITING_FOR_PLAYER_ACTIONS,
            },
            {
              guard: {
                type: GameGuards.IS_WINDOW_CARD_OF_TYPE,
                params: { cardType: CardType.SEE_THE_FUTURE },
              },
              actions: [emit(showedTopThreeCards)],
              target: GameStates.WAITING_FOR_PLAYER_ACTIONS,
            },
            {
              guard: {
                type: GameGuards.IS_WINDOW_CARD_OF_TYPE,
                params: { cardType: CardType.FAVOR },
              },
              actions: [], // TODO: Implement new game state for waiting for favor
              target: GameStates.WAITING_FOR_PLAYER_ACTIONS,
            },
            // Fallback: RESOLVING_NOPES only passes through, so without an unguarded transition the machine gets stuck when no guard above matches (combos, cat cards, card types not implemented yet).
            {
              target: GameStates.WAITING_FOR_PLAYER_ACTIONS,
            },
          ],
        },
        [GameStates.CHECKING_DRAWN_CARD]: {
          always: [
            {
              guard: GameGuards.IS_EXPLODING_KITTEN_DRAWN,
              target: GameTargets.EXPLODING_KITTEN_DRAWN,
            },
            {
              target: GameTargets.CHECKING_REMAINING_TURNS,
            },
          ],
        },
        [GameStates.CHECKING_REMAINING_TURNS]: {
          always: [
            {
              guard: and([GameGuards.HAS_REMAINING_TURNS]),
              target: GameTargets.WAITING_FOR_PLAYER_ACTIONS,
            },
            {
              target: GameTargets.CHANGING_TURN,
            },
          ],
        },
        [GameStates.EXPLODING_KITTEN_DRAWN]: {
          entry: emit(kittenDrawn),
          always: [
            {
              guard: GameGuards.HAS_DEFUSE_CARD,
              target: GameTargets.WAITING_FOR_DEFUSE_CARD,
            },
            {
              target: GameTargets.EXPLODING_PLAYER,
            },
          ],
        },
        [GameStates.WAITING_FOR_DEFUSE_CARD]: {
          entry: [GameActions.SET_DEFUSE_COUNTDOWN_ENDS_AT, emit(defusePrompt)],
          exit: GameActions.CLEAR_COUNTDOWN_ENDS_AT,
          after: {
            [WAIT_FOR_DEFUSE_TIMEOUT]: {
              target: GameTargets.EXPLODING_PLAYER,
            },
          },
          on: {
            [GameEvents.PLAY_DEFUSE]: {
              guard: GameGuards.HAS_DEFUSE_CARD,
              actions: [GameActions.DEFUSE_KITTEN, emit(playerDefused)],
              target: GameTargets.WAITING_FOR_KITTEN_INSERTION,
            },
          },
        },
        [GameStates.WAITING_FOR_KITTEN_INSERTION]: {
          on: {
            [GameEvents.INSERT_KITTEN]: {
              actions: [GameActions.INSERT_KITTEN, emit(kittenInserted)],
              target: GameTargets.CHECKING_REMAINING_TURNS,
            },
          },
        },
        [GameStates.EXPLODING_PLAYER]: {
          entry: [GameActions.EXPLODE_PLAYER, emit(playerEliminated)],
          always: [
            {
              guard: GameGuards.IS_ONLY_ONE_PLAYER_LEFT_ALIVE,
              target: GameTargets.GAME_OVER,
            },
            {
              target: GameTargets.CHANGING_TURN,
            },
          ],
        },
        [GameStates.SELECTING_PLAYER]: {},
        [GameStates.WAITING_FOR_CARD_SELECTION]: {},
      },
    },
    [GameStates.GAME_OVER]: {
      entry: [emit(gameOver)],
      on: {
        [GameEvents.LEAVE_GAME]: {
          actions: GameActions.REMOVE_PLAYER,
        },
      },
    },
  },
});
