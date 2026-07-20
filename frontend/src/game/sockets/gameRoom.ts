import {
  ClientEvents,
  ServerPrivateEvents,
  ServerPublicEvents,
  type CardPlayedPayload,
  type CardRemovedPayload,
  type GameStatePayload,
  type PlayerIdPayload,
} from "@exploding-cats/contracts";
import type { CardPayload } from "@exploding-cats/game-core";
import { socket } from "socket";
import { emit, leaveGame } from "./gameSession";

export interface GameRoomHandlers {
  onCardReceived(card: CardPayload): void;
  onCardDrawn(payload: PlayerIdPayload): void;
  onGameState(payload: GameStatePayload): void;
  onTurnChanged(payload: PlayerIdPayload): void;
  onCardRemoved(payload: CardRemovedPayload): void;
  onCardPlayed(payload: CardPlayedPayload): void;
  onPlayerDisconnected(payload: PlayerIdPayload): void;
  onPlayerReconnected(payload: PlayerIdPayload): void;
}

export type CleanupFunction = () => void;
let lastGameState: GameStatePayload | null = null;

export const hasCachedGameState = () => lastGameState !== null;

export function trackGameState(): CleanupFunction {
  const cache = (payload: GameStatePayload) => {
    lastGameState = payload;
  };

  socket.on(ServerPrivateEvents.GAME_STATE, cache);

  return () => {
    socket.off(ServerPrivateEvents.GAME_STATE, cache);
    lastGameState = null;
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
    [ServerPublicEvents.PLAYER_DISCONNECTED, handlers.onPlayerDisconnected],
    [ServerPublicEvents.PLAYER_RECONNECTED, handlers.onPlayerReconnected],
  ] as const;

  subscriptions.forEach(([event, handler]) => {
    socket.on(event, handler);
  });

  if (lastGameState) handlers.onGameState(lastGameState);

  return () => {
    subscriptions.forEach(([event, handler]) => {
      socket.off(event, handler);
    });
  };
}

export const drawCard = () => emit(ClientEvents.DRAW_CARD);
export const playCard = (cardId: number) =>
  emit(ClientEvents.PLAY_CARD, { cardId });
export const leaveCurrentGame = leaveGame;
