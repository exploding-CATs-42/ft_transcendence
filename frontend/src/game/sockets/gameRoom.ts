import {
  ClientEvents,
  ServerPrivateEvents,
  ServerPublicEvents,
  type CardGivenPayload,
  type CardPlayedPayload,
  type CardRemovedPayload,
  type ComboPlayedPayload,
  type DefusePromptPayload,
  type GameStatePayload,
  type NopePlayedPayload,
  type PlayerIdPayload,
  type SeeTheFuturePeekPayload,
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
}

export type CleanupFunction = () => void;
let lastGameState: GameStatePayload | null = null;
let lastTurnChanged: TurnChangedPayload | null = null;

export const hasCachedGameState = () => lastGameState !== null;

export const getCachedGameState = () => lastGameState;

export function trackGameState(): CleanupFunction {
  const cacheState = (payload: GameStatePayload) => {
    lastGameState = payload;
  };
  const cacheTurn = (payload: TurnChangedPayload) => {
    lastTurnChanged = payload;
  };

  socket.on(ServerPrivateEvents.GAME_STATE, cacheState);
  socket.on(ServerPublicEvents.TURN_CHANGED, cacheTurn);

  return () => {
    socket.off(ServerPrivateEvents.GAME_STATE, cacheState);
    socket.off(ServerPublicEvents.TURN_CHANGED, cacheTurn);
    lastGameState = null;
    lastTurnChanged = null;
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
      ServerPublicEvents.WAITING_FOR_FAVOR_CARD_SELECTION,
      handlers.onWaitingForFavorCardSelection,
    ],
    [ServerPublicEvents.PLAYER_LEFT, handlers.onPlayerLeft],
  ] as const;

  subscriptions.forEach(([event, handler]) => {
    socket.on(event, handler);
  });

  if (lastGameState) handlers.onGameState(lastGameState);
  if (lastTurnChanged) handlers.onTurnChanged(lastTurnChanged);

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
