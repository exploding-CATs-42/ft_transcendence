import {
  ClientEvents,
  ServerPrivateEvents,
  ServerPublicEvents,
  type PlayerIdPayload,
} from "@exploding-cats/contracts";
import type { CardPayload } from "@exploding-cats/game-core";
import { socket } from "socket";
import { emit } from "./gameSession";

export interface GameRoomHandlers {
  onCardReceived(card: CardPayload): void;
  onTurnChanged(payload: PlayerIdPayload): void;
}

export type CleanupFunction = () => void;

export function attachGameRoomSockets(
  handlers: GameRoomHandlers,
): CleanupFunction {
  const subscriptions = [
    [ServerPrivateEvents.CARD_RECEIVED, handlers.onCardReceived],
    [ServerPublicEvents.TURN_CHANGED, handlers.onTurnChanged],
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
