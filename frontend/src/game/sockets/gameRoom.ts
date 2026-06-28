import {
  ClientEvents,
  ServerPrivateEvents,
  type HandPayload,
} from "@exploding-cats/contracts";
import type { CardPayload } from "@exploding-cats/game-core";
import { socket } from "socket";
import { emit } from "./gameSession";

export interface GameRoomHandlers {
  onCardsDealt(hand: HandPayload): void;
  onCardReceived(card: CardPayload): void;
}

export type CleanupFunction = () => void;

export function attachGameRoomSockets(
  handlers: GameRoomHandlers,
): CleanupFunction {
  const subscriptions = [
    [ServerPrivateEvents.YOUR_HAND, handlers.onCardsDealt],
    [ServerPrivateEvents.CARD_RECEIVED, handlers.onCardReceived],
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
