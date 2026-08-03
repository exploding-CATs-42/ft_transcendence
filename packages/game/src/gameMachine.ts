// Libraries
import { and, assign, emit, not, setup } from "xstate";
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
  selectPlayer,
  passCardById,
  resolveCombo,
  declareCombo,
  clearPendingCombo,
} from "./actions";
import {
  type Player,
  type Deck,
  type Card,
  type NopeWindow,
  type PendingCombo,
  CardType,
  PendingActionType,
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
  lastPlayedCardOfType,
  pendingActionOfType,
  leavesSingleAlivePlayer,
  hasPendingCombo,
  isPendingComboPlayersTurn,
  hasEligibleComboTarget,
  canResolveCombo,
  canDeclareCombo,
  hasDeclaredCombo,
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
  playerSelected,
  turnChanged,
  turnSkipped,
  playerEliminated,
  gameOver,
  waitingForPlayerSelection,
  waitingForFavorCardSelection,
  playerSawTheFuture,
  comboSelectionRequested,
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
  pendingAction: PendingActionType | null;
  pendingCombo: PendingCombo | null;
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
    [GameActions.SELECT_PLAYER]: assign(selectPlayer),
    [GameActions.PASS_CARD_BY_ID]: assign(passCardById),
    [GameActions.RESOLVE_COMBO]: assign(resolveCombo),
    [GameActions.DECLARE_COMBO]: assign(declareCombo),
    [GameActions.CLEAR_PENDING_COMBO]: assign(clearPendingCombo),
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
    [GameGuards.LEAVES_SINGLE_ALIVE_PLAYER]: leavesSingleAlivePlayer,
    [GameGuards.IS_PLAYERS_TURN]: isPlayersTurn,
    [GameGuards.IS_NOPED]: isNoped,
    [GameGuards.CAN_PLAY_NOPE]: canPlayNope,
    [GameGuards.HAS_REMAINING_TURNS]: hasRemainingTurns,
    [GameGuards.LAST_PLAYED_CARD_OF_TYPE]: lastPlayedCardOfType,
    [GameGuards.PENDING_ACTION_OF_TYPE]: pendingActionOfType,
    [GameGuards.HAS_PENDING_COMBO]: hasPendingCombo,
    [GameGuards.IS_PENDING_COMBO_PLAYERS_TURN]: isPendingComboPlayersTurn,
    [GameGuards.HAS_ELIGIBLE_COMBO_TARGET]: hasEligibleComboTarget,
    [GameGuards.CAN_RESOLVE_COMBO]: canResolveCombo,
    [GameGuards.CAN_DECLARE_COMBO]: canDeclareCombo,
    [GameGuards.HAS_DECLARED_COMBO]: hasDeclaredCombo,
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
    pendingAction: null,
    pendingCombo: null,
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
        [GameEvents.LEAVE_GAME]: [
          {
            guard: GameGuards.LEAVES_SINGLE_ALIVE_PLAYER,
            actions: GameActions.REMOVE_PLAYER,
            target: GameTargets.GAME_OVER,
          },
          {
            actions: GameActions.REMOVE_PLAYER,
          },
        ],
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
              actions: GameActions.PLAY_COMBO,
              target: GameStates.WAITING_FOR_COMBO_SELECTION,
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
              actions: GameActions.CLEAR_PENDING_COMBO,
              target: GameStates.WAITING_FOR_PLAYER_ACTIONS,
            },
            {
              guard: and([
                GameGuards.HAS_PENDING_COMBO,
                GameGuards.HAS_DECLARED_COMBO,
              ]),
              target: GameTargets.WAITING_FOR_COMBO_SELECTION,
            },
            {
              guard: GameGuards.HAS_PENDING_COMBO,
              actions: GameActions.CLEAR_PENDING_COMBO,
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
              target: GameStates.PLAYER_LOOKS_AT_THE_FUTURE,
            },
            {
              guard: {
                type: GameGuards.IS_WINDOW_CARD_OF_TYPE,
                params: { cardType: CardType.FAVOR },
              },
              target: GameTargets.SELECTING_PLAYER,
            },
            // Fallback: RESOLVING_NOPES only passes through, so without an unguarded transition the machine gets stuck when no guard above matches (combos, cat cards, card types not implemented yet).
            {
              target: GameStates.WAITING_FOR_PLAYER_ACTIONS,
            },
          ],
        },
        [GameStates.WAITING_FOR_COMBO_SELECTION]: {
          entry: emit(comboSelectionRequested),
          always: [
            {
              guard: not(GameGuards.IS_PENDING_COMBO_PLAYERS_TURN),
              actions: GameActions.CLEAR_PENDING_COMBO,
              target: GameStates.CHANGING_TURN,
            },
            {
              guard: not(GameGuards.HAS_ELIGIBLE_COMBO_TARGET),
              actions: GameActions.CLEAR_PENDING_COMBO,
              target: GameStates.WAITING_FOR_PLAYER_ACTIONS,
            },
          ],
          on: {
            [GameEvents.RESOLVE_COMBO]: [
              {
                guard: GameGuards.CAN_DECLARE_COMBO,
                actions: [
                  GameActions.DECLARE_COMBO,
                  GameActions.SET_NOPE_WINDOW,
                ],
                target: GameStates.WAITING_FOR_NOPES,
              },
              {
                guard: GameGuards.CAN_RESOLVE_COMBO,
                actions: [
                  GameActions.RESOLVE_COMBO,
                  GameActions.CLEAR_PENDING_COMBO,
                ],
                target: GameStates.WAITING_FOR_PLAYER_ACTIONS,
              },
            ],
          },
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
        [GameStates.SELECTING_PLAYER]: {
          entry: emit(waitingForPlayerSelection),
          on: {
            [GameEvents.SELECT_PLAYER]: {
              guard: {
                type: GameGuards.PENDING_ACTION_OF_TYPE,
                params: { actionType: PendingActionType.FAVOR },
              },
              actions: [GameActions.SELECT_PLAYER, emit(playerSelected)],
              target: GameTargets.WAITING_FOR_FAVOR_CARD_SELECTION,
            },
          },
        },
        [GameStates.WAITING_FOR_FAVOR_CARD_SELECTION]: {
          entry: emit(waitingForFavorCardSelection),
          on: {
            [GameEvents.PASS_CARD_BY_ID]: {
              actions: GameActions.PASS_CARD_BY_ID,
              target: GameTargets.WAITING_FOR_PLAYER_ACTIONS,
            },
          },
        },
        [GameStates.PLAYER_LOOKS_AT_THE_FUTURE]: {
          on: {
            [GameEvents.SEEN_THE_FUTURE]: {
              actions: emit(playerSawTheFuture),
              target: GameTargets.WAITING_FOR_PLAYER_ACTIONS,
            },
          },
        },
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
