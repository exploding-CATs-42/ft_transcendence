import { ServerPrivateEvents, type Hand } from "@exploding-cats/shared-types";
import { socket } from "socket";

export interface GameRoomHandlers {
  onCardsDealt(hand: Hand): void;
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
