import {
  ClientEvents,
  ServerPrivateEvents,
  ServerPublicEvents,
  type CardGivenPayload,
  type CardPlayedPayload,
  type CardRemovedPayload,
  type ComboPlayedPayload,
  type DefusePromptPayload,
  type GameStartedPayload,
  type GameStatePayload,
  type NopePlayedPayload,
  type PlayerIdPayload,
  type SeeTheFuturePeekPayload,
  type SocketErrorPayload,
  type TurnChangedPayload,
  type TurnSkippedPayload,
  type CardReceivedPayload,
  type CardStolenPayload,
} from "@exploding-cats/contracts";
import type {
  ExplodingKittenDrawnPayload,
  CardType,
  GameOverPayload,
  KittenInsertedPayload,
  NoCardOfRequestedTypePayload,
  PlayerDefusedPayload,
  PlayerEliminatedPayload,
  PlayerSelectedPayload,
  WaitingForCardIdSelectionPayload,
  WaitingForCardIndexSelectionPayload,
  WaitingForCardTypeSelectionPayload,
} from "@exploding-cats/game-core";
import { socket } from "socket";
import { emit, leaveGame } from "./gameSession";
import { GAME_ROOM_ERROR_EVENTS, type GameRoomErrorEvent } from "./errorEvents";

export interface GameRoomHandlers {
  onCardReceived(card: CardReceivedPayload): void;
  onCardDrawn(payload: PlayerIdPayload): void;
  onGameState(payload: GameStatePayload): void;
  onTurnChanged(payload: TurnChangedPayload): void;
  onCardRemoved(payload: CardRemovedPayload): void;
  onCardPlayed(payload: CardPlayedPayload): void;
  onDefusePrompt(payload: DefusePromptPayload): void;
  onPlayerDefused(payload: PlayerDefusedPayload): void;
  onPlayerEliminated(payload: PlayerEliminatedPayload): void;
  onPlayerDisconnected(payload: PlayerIdPayload): void;
  onPlayerReconnected(payload: PlayerIdPayload): void;
  onDeckShuffled(): void;
  onTurnSkipped(payload: TurnSkippedPayload): void;
  onComboPlayed(payload: ComboPlayedPayload): void;
  onGameError(event: GameRoomErrorEvent, payload: SocketErrorPayload): void;
  onSeeTheFuturePeek(payload: SeeTheFuturePeekPayload): void;
  onKittenDrawn(payload: ExplodingKittenDrawnPayload): void;
  onKittenInserted(payload: KittenInsertedPayload): void;
  onGameOver(payload: GameOverPayload): void;
  onNopePlayed(payload: NopePlayedPayload): void;
  onNopeWindowResolved(): void;
  onPlayerSelected(payload: PlayerSelectedPayload): void;
  onCardGiven(payload: CardGivenPayload): void;
  onWaitingForPlayerSelection(): void;
  onWaitingForCardIdSelection(payload: WaitingForCardIdSelectionPayload): void;
  onPlayerLeft(payload: PlayerIdPayload): void;
  onPlayerSawTheFuture(): void;
  onPlayerLooksAtTheFuture(): void;
  onWaitingForCardIndexSelection(
    payload: WaitingForCardIndexSelectionPayload,
  ): void;
  onWaitingForCardTypeSelection(
    payload: WaitingForCardTypeSelectionPayload,
  ): void;
  onNoCardOfRequestedType(payload: NoCardOfRequestedTypePayload): void;
  onCardStolen(payload: CardStolenPayload): void;
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
    };
  };

  const setConnected = (playerId: string, isConnected: boolean) => {
    if (!cachedState) return;

    cachedState = {
      ...cachedState,
      players: cachedState.players.map((player) =>
        player.id === playerId ? { ...player, isConnected } : player,
      ),
    };
  };

  const onDisconnected = ({ playerId }: PlayerIdPayload) =>
    setConnected(playerId, false);

  const onReconnected = ({ playerId }: PlayerIdPayload) =>
    setConnected(playerId, true);

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
  socket.on(ServerPublicEvents.PLAYER_DISCONNECTED, onDisconnected);
  socket.on(ServerPublicEvents.PLAYER_RECONNECTED, onReconnected);

  return () => {
    socket.off(ServerPrivateEvents.GAME_STARTED, onStarted);
    socket.off(ServerPrivateEvents.GAME_STATE, onState);
    socket.off(ServerPublicEvents.TURN_CHANGED, onTurn);
    socket.off(ServerPublicEvents.PLAYER_DISCONNECTED, onDisconnected);
    socket.off(ServerPublicEvents.PLAYER_RECONNECTED, onReconnected);
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
      ServerPublicEvents.WAITING_FOR_CARD_ID_SELECTION,
      handlers.onWaitingForCardIdSelection,
    ],
    [ServerPublicEvents.PLAYER_LEFT, handlers.onPlayerLeft],
    [ServerPublicEvents.PLAYER_SAW_THE_FUTURE, handlers.onPlayerSawTheFuture],
    [
      ServerPublicEvents.PLAYER_LOOKS_AT_THE_FUTURE,
      handlers.onPlayerLooksAtTheFuture,
    ],
    [
      ServerPublicEvents.WAITING_FOR_CARD_INDEX_SELECTION,
      handlers.onWaitingForCardIndexSelection,
    ],
    [
      ServerPublicEvents.WAITING_FOR_CARD_TYPE_SELECTION,
      handlers.onWaitingForCardTypeSelection,
    ],
    [
      ServerPublicEvents.NO_CARD_OF_REQUESTED_TYPE,
      handlers.onNoCardOfRequestedType,
    ],
    [ServerPublicEvents.CARD_STOLEN, handlers.onCardStolen],
  ] as const;

  const errorSubscriptions = GAME_ROOM_ERROR_EVENTS.map((event) => {
    const handler = (payload: SocketErrorPayload) =>
      handlers.onGameError(event, payload);

    return [event, handler] as const;
  });

  subscriptions.forEach(([event, handler]) => {
    socket.on(event, handler);
  });
  errorSubscriptions.forEach(([event, handler]) => {
    socket.on(event, handler);
  });

  return () => {
    subscriptions.forEach(([event, handler]) => {
      socket.off(event, handler);
    });
    errorSubscriptions.forEach(([event, handler]) => {
      socket.off(event, handler);
    });
  };
}

export const drawCard = () => emit(ClientEvents.DRAW_CARD);
export const playCard = (cardId: number) =>
  emit(ClientEvents.PLAY_CARD, { cardId });
export const playCombo = (cardIds: number[]) =>
  emit(ClientEvents.PLAY_COMBO, { cardIds });
export const playDefuse = () => emit(ClientEvents.PLAY_DEFUSE);
export const insertKitten = (explodingKittenPosition: number) =>
  emit(ClientEvents.INSERT_KITTEN, { explodingKittenPosition });
export const playNope = (cardId: number) =>
  emit(ClientEvents.PLAY_NOPE, { cardId });
export const seenTheFuture = () => emit(ClientEvents.SEEN_THE_FUTURE);
export const selectPlayer = (playerId: string) =>
  emit(ClientEvents.SELECT_PLAYER, { playerId });
export const chooseCardId = (cardId: number) =>
  emit(ClientEvents.CHOOSE_CARD_ID, { cardId });
export const chooseCardIndex = (cardIndex: number) =>
  emit(ClientEvents.CHOOSE_CARD_INDEX, { cardIndex });
export const chooseCardType = (cardType: CardType) =>
  emit(ClientEvents.CHOOSE_CARD_TYPE, { cardType });

export const leaveCurrentGame = leaveGame;
