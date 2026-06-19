import {
  ServerPrivateEvents,
  type HandPayload,
} from "@exploding-cats/contracts";
import { socket } from "socket";

export interface GameRoomHandlers {
  onCardsDealt(hand: HandPayload): void;
}

export type CleanupFunction = () => void;

export function attachGameRoomSockets(
  handlers: GameRoomHandlers,
): CleanupFunction {
  const subscriptions = [
    [ServerPrivateEvents.YOUR_HAND, handlers.onCardsDealt],
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
