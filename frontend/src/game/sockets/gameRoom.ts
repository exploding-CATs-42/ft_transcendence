import {
  ClientEvents,
  ServerErrorEvents,
  ServerPrivateEvents,
  ServerPublicEvents,
  type CardGivenPayload,
  type CardPlayedPayload,
  type CardRemovedPayload,
  type ComboPlayedPayload,
  type ComboResolvedPayload,
  type ComboSelectionRequestedPayload,
  type ComboTargetSelectedPayload,
  type DefusePromptPayload,
  type GameStartedPayload,
  type GameStatePayload,
  type NopePlayedPayload,
  type PlayerIdPayload,
  type SeeTheFuturePeekPayload,
  type SocketErrorPayload,
  type TurnChangedPayload,
  type TurnSkippedPayload,
} from "@exploding-cats/contracts";
import type {
  CardPayload,
  GameOverPayload,
  KittenInsertedPayload,
  PlayerDefusedPayload,
  PlayerSelectedPayload,
  WaitingForFavorCardSelectionPayload,
} from "@exploding-cats/game-core";
import { socket } from "socket";
import { emit, leaveGame } from "./gameSession";

export interface GameRoomHandlers {
  onCardReceived(card: CardPayload): void;
  onCardDrawn(payload: PlayerIdPayload): void;
  onGameState(payload: GameStatePayload): void;
  onTurnChanged(payload: TurnChangedPayload): void;
  onCardRemoved(payload: CardRemovedPayload): void;
  onCardPlayed(payload: CardPlayedPayload): void;
  onDefusePrompt(payload: DefusePromptPayload): void;
  onPlayerDefused(payload: PlayerDefusedPayload): void;
  onPlayerEliminated(payload: PlayerIdPayload): void;
  onPlayerDisconnected(payload: PlayerIdPayload): void;
  onPlayerReconnected(payload: PlayerIdPayload): void;
  onDeckShuffled(): void;
  onTurnSkipped(payload: TurnSkippedPayload): void;
  onComboPlayed(payload: ComboPlayedPayload): void;
  onComboPlayError(payload: SocketErrorPayload): void;
  onComboSelectionRequested(payload: ComboSelectionRequestedPayload): void;
  onComboTargetSelected(payload: ComboTargetSelectedPayload): void;
  onComboTargetCleared(): void;
  onComboResolved(payload: ComboResolvedPayload): void;
  onComboResolutionError(payload: SocketErrorPayload): void;
  onSeeTheFuturePeek(payload: SeeTheFuturePeekPayload): void;
  onKittenDrawn(): void;
  onKittenInserted(payload: KittenInsertedPayload): void;
  onGameOver(payload: GameOverPayload): void;
  onNopePlayed(payload: NopePlayedPayload): void;
  onNopeWindowResolved(): void;
  onPlayerSelected(payload: PlayerSelectedPayload): void;
  onCardGiven(payload: CardGivenPayload): void;
  onWaitingForPlayerSelection(): void;
  onWaitingForFavorCardSelection(
    payload: WaitingForFavorCardSelectionPayload,
  ): void;
  onPlayerLeft(payload: PlayerIdPayload): void;
  onPlayerSawTheFuture(): void;
  onPlayerLooksAtTheFuture(): void;
}

export type CleanupFunction = () => void;
let cachedState: GameStatePayload | null = null;

export const hasCachedGameState = () => cachedState !== null;
export const getCachedGameState = () => cachedState;

export function trackGameState(): CleanupFunction {
  // Fresh start: no turn yet, the TURN_CHANGED right after fills it in.
  const onStarted = (payload: GameStartedPayload) => {
    cachedState = {
      ...payload,
      currentTurnPlayerId: null,
      lastPlayedCards: null,
      attackCount: 1,
      machineState: null,
      selectedPlayerId: null,
      countdownEndsAt: null,
      topCards: null,
      pendingComboSize: null,
      pendingComboTargetPlayerId: null,
      pendingComboRequestedCardType: null,
    };
  };

  // Reload: server already sends a full snapshot.
  const onState = (payload: GameStatePayload) => {
    cachedState = payload;
  };

  const onTurn = (payload: TurnChangedPayload) => {
    if (!cachedState) return;

    cachedState = {
      ...cachedState,
      currentTurnPlayerId: payload.playerId,
      attackCount: payload.attackCount,
    };
  };

  socket.on(ServerPrivateEvents.GAME_STARTED, onStarted);
  socket.on(ServerPrivateEvents.GAME_STATE, onState);
  socket.on(ServerPublicEvents.TURN_CHANGED, onTurn);

  return () => {
    socket.off(ServerPrivateEvents.GAME_STARTED, onStarted);
    socket.off(ServerPrivateEvents.GAME_STATE, onState);
    socket.off(ServerPublicEvents.TURN_CHANGED, onTurn);
    cachedState = null;
  };
}

export function attachGameRoomSockets(
  handlers: GameRoomHandlers,
): CleanupFunction {
  const onGameState = (payload: GameStatePayload) =>
    handlers.onGameState(payload);
  const subscriptions = [
    [ServerPrivateEvents.CARD_RECEIVED, handlers.onCardReceived],
    [ServerPublicEvents.CARD_DRAWN, handlers.onCardDrawn],
    [ServerPrivateEvents.GAME_STATE, onGameState],
    [ServerPublicEvents.TURN_CHANGED, handlers.onTurnChanged],
    [ServerPrivateEvents.CARD_REMOVED, handlers.onCardRemoved],
    [ServerPublicEvents.CARD_PLAYED, handlers.onCardPlayed],
    [ServerPrivateEvents.DEFUSE_PROMPT, handlers.onDefusePrompt],
    [ServerPublicEvents.PLAYER_DEFUSED, handlers.onPlayerDefused],
    [ServerPublicEvents.PLAYER_ELIMINATED, handlers.onPlayerEliminated],
    [ServerPublicEvents.KITTEN_INSERTED, handlers.onKittenInserted],
    [ServerPublicEvents.EXPLODING_KITTEN_DRAWN, handlers.onKittenDrawn],
    [ServerPublicEvents.PLAYER_DISCONNECTED, handlers.onPlayerDisconnected],
    [ServerPublicEvents.PLAYER_RECONNECTED, handlers.onPlayerReconnected],
    [ServerPublicEvents.DECK_SHUFFLED, handlers.onDeckShuffled],
    [ServerPublicEvents.TURN_SKIPPED, handlers.onTurnSkipped],
    [ServerPublicEvents.COMBO_PLAYED, handlers.onComboPlayed],
    [ServerErrorEvents.PLAY_COMBO_ERROR, handlers.onComboPlayError],
    [
      ServerPublicEvents.COMBO_SELECTION_REQUESTED,
      handlers.onComboSelectionRequested,
    ],
    [ServerPublicEvents.COMBO_TARGET_SELECTED, handlers.onComboTargetSelected],
    [ServerPublicEvents.COMBO_TARGET_CLEARED, handlers.onComboTargetCleared],
    [ServerPublicEvents.COMBO_RESOLVED, handlers.onComboResolved],
    [ServerErrorEvents.RESOLVE_COMBO_ERROR, handlers.onComboResolutionError],
    [ServerPrivateEvents.SEE_THE_FUTURE_PEEK, handlers.onSeeTheFuturePeek],
    [ServerPublicEvents.GAME_OVER, handlers.onGameOver],
    [ServerPublicEvents.NOPE_PLAYED, handlers.onNopePlayed],
    [ServerPublicEvents.NOPE_WINDOW_RESOLVED, handlers.onNopeWindowResolved],
    [ServerPublicEvents.PLAYER_SELECTED, handlers.onPlayerSelected],
    [ServerPublicEvents.CARD_GIVEN, handlers.onCardGiven],
    [
      ServerPublicEvents.WAITING_FOR_PLAYER_SELECTION,
      handlers.onWaitingForPlayerSelection,
    ],
    [
      ServerPublicEvents.WAITING_FOR_FAVOR_CARD_SELECTION,
      handlers.onWaitingForFavorCardSelection,
    ],
    [ServerPublicEvents.PLAYER_LEFT, handlers.onPlayerLeft],
    [ServerPublicEvents.PLAYER_SAW_THE_FUTURE, handlers.onPlayerSawTheFuture],
    [
      ServerPublicEvents.PLAYER_LOOKS_AT_THE_FUTURE,
      handlers.onPlayerLooksAtTheFuture,
    ],
  ] as const;

  subscriptions.forEach(([event, handler]) => {
    socket.on(event, handler);
  });

  return () => {
    subscriptions.forEach(([event, handler]) => {
      socket.off(event, handler);
    });
  };
}

export const drawCard = () => emit(ClientEvents.DRAW_CARD);
export const playCard = (cardId: number) =>
  emit(ClientEvents.PLAY_CARD, { cardId });
export const playCombo = (cardIds: number[]) =>
  emit(ClientEvents.PLAY_COMBO, { cardIds });
export const selectComboTarget = (targetPlayerId: string) =>
  emit(ClientEvents.SELECT_COMBO_TARGET, { targetPlayerId });
export const declareTwoCardCombo = (targetPlayerId: string) =>
  emit(ClientEvents.RESOLVE_COMBO, { targetPlayerId });
export const resolveTwoCardCombo = (
  targetPlayerId: string,
  cardIndex: number,
) => emit(ClientEvents.RESOLVE_COMBO, { targetPlayerId, cardIndex });
export const resolveThreeCardCombo = (
  targetPlayerId: string,
  requestedCardType: import("@exploding-cats/game-core").CardType,
) =>
  emit(ClientEvents.RESOLVE_COMBO, {
    targetPlayerId,
    requestedCardType,
  });
export const playDefuse = () => emit(ClientEvents.PLAY_DEFUSE);
export const insertKitten = (explodingKittenPosition: number) =>
  emit(ClientEvents.INSERT_KITTEN, { explodingKittenPosition });
export const playNope = (cardId: number) =>
  emit(ClientEvents.PLAY_NOPE, { cardId });
export const selectPlayer = (playerId: string) =>
  emit(ClientEvents.SELECT_PLAYER, { playerId });

export const leaveCurrentGame = leaveGame;
export const giveCard = (
  playerIdFrom: string,
  playerIdTo: string,
  cardId: number,
) => emit(ClientEvents.GIVE_CARD, { playerIdFrom, playerIdTo, cardId });
export const seenTheFuture = () => emit(ClientEvents.SEEN_THE_FUTURE);
