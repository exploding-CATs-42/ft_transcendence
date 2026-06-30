import {
  ClientEvents,
  ServerPrivateEvents,
  ServerPublicEvents,
} from "@exploding-cats/contracts";
import type { CardPayload } from "@exploding-cats/game-core";
import type { Card } from "@exploding-cats/game-core";
import type { Player } from "game/@types";
import { socket } from "socket";
import { emit } from "./gameSession";

// REMOVE THIS LATER
export type GameStartedPayload = {
  players: Player[];
  hand: { cards: Card[] };
};

export interface GameRoomHandlers {
  onCardReceived(card: CardPayload): void;
  onGameStarted(payload: GameStartedPayload): void;
}

export type CleanupFunction = () => void;

export function attachGameRoomSockets(
  handlers: GameRoomHandlers,
): CleanupFunction {
  const subscriptions = [
    [ServerPrivateEvents.CARD_RECEIVED, handlers.onCardReceived],
    [ServerPublicEvents.GAME_STARTED, handlers.onGameStarted],
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
