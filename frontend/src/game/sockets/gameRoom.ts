import {
  ClientEvents,
  ServerPrivateEvents,
  ServerPublicEvents,
} from "@exploding-cats/contracts";
import type { CardPayload, Card } from "@exploding-cats/game-core";
import type { Player } from "game/@types";
import { socket } from "socket";
import { emit } from "./gameSession";

// REMOVE THIS LATER
export type GameStartedPayload = {
  players: Player[];
  hand: Card[];
};

export interface GameRoomHandlers {
  onCardReceived(card: CardPayload): void;
  onGameStarted(payload: GameStartedPayload): void;
  onCardRemoved(): void;
}

export type CleanupFunction = () => void;

export function attachGameRoomSockets(
  handlers: GameRoomHandlers,
): CleanupFunction {
  const subscriptions = [
    [ServerPrivateEvents.CARD_RECEIVED, handlers.onCardReceived],
    [ServerPublicEvents.GAME_STARTED, handlers.onGameStarted],
    [ServerPrivateEvents.CARD_REMOVED, handlers.onCardRemoved],
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
export const dropCard = () => emit(ClientEvents.DROP_CARD, dropCard);
