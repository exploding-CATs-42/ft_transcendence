// Libraries
import { socket } from "socket";
// Project level
import type { OpponentHandController } from "game/controllers";
import { ServerPrivateEvents } from "@exploding-cats/contracts";

export class OpponentSocketHandlers {
  #subscriptions;
  #controller;

  constructor(controller: OpponentHandController) {
    this.#controller = controller;

    this.#subscriptions = [
      [ServerPrivateEvents.OPPONENT_DREW_CARD, this.onCardTaken],
    ] as const;

    this.#subscriptions.forEach(([event, handler]) => {
      socket.on(event, handler);
    });
  }

  destroy() {
    this.#subscriptions.forEach(([event, handler]) => {
      socket.off(event, handler);
    });
  }

  private onCardTaken = () => {
    this.#controller.onCardTaken();
  };
}
