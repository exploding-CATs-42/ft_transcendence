// Libraries
import type { Socket } from "socket.io-client";
// Project level
import {
  OpponentEvents,
  OpponentOutEvents,
  type OpponentInstance,
} from "game/entities/model";
import { OpponentHand } from "game/entities/graphic";
import { ServerPublicEvents } from "@exploding-cats/contracts";

export class OpponentHandController {
  #machine: OpponentInstance;
  #view: OpponentHand;

  constructor(machine: OpponentInstance, view: OpponentHand, socket: Socket) {
    this.#machine = machine;
    this.#view = view;

    this.connectSocketToHandlers(socket);
    this.subscribeToMachineEvents(machine);
  }

  // Socket event arrives
  private connectSocketToHandlers = (socket: Socket) => {
    socket.on(ServerPublicEvents.OPPONENT_DREW_CARD, this.onCardTaken);
    socket.on(ServerPublicEvents.OPPONENT_PLAYED_CARD, this.onCardPlayed);
  };

  // Contoller sends it to the machine
  onTakeCard = () => {
    this.#machine.send({ type: OpponentEvents.TAKE_CARD });
  };

  onPlayCard = () => {
    this.#machine.send({ type: OpponentEvents.PLAY_CARD });
  };

  // Machine updates and notifies the controller
  private subscribeToMachineEvents = (machine: OpponentInstance) => {
    machine.on(OpponentOutEvents.CARD_TAKEN, this.onCardTaken);
    machine.on(OpponentOutEvents.CARD_PLAYED, this.onCardPlayed);
  };

  // And controller updates the View
  onCardTaken = () => {
    this.#view.addCard();
  };

  onCardPlayed = () => {
    this.#view.removeCard();
  };
}
