// Libraries
import type { Socket } from "socket.io-client";
// Project level
import {
  OpponentEvents,
  OpponentOutEvents,
  type OpponentInstance,
} from "game/entities/model";
import { OpponentHand } from "game/entities/graphic";
import {
  ServerPrivateEvents,
  ServerPublicEvents,
} from "@exploding-cats/contracts";

export class OpponentHandController {
  #machine: OpponentInstance;
  #view: OpponentHand;
  #socket: Socket;

  constructor(machine: OpponentInstance, view: OpponentHand, socket: Socket) {
    this.#machine = machine;
    this.#view = view;
    this.#socket = socket;

    this.connectSocketToHandlers(socket);
    this.subscribeToMachineEvents(machine);
  }

  private connectSocketToHandlers = (socket: Socket) => {
    socket.on(ServerPublicEvents.PLAYER_CONFIRMED);
  };

  onTakeCard = () => {
    this.#machine.send({ type: OpponentEvents.TAKE_CARD });
  };

  onCardTaken = () => {
    this.#view.addCard();
  };

  private subscribeToMachineEvents = (machine: OpponentInstance) => {
    machine.on(OpponentOutEvents.CARD_TAKEN, this.onCardTaken);
  };
}

// // controllers/HandController.ts
// constructor(machine, view, socket) {
//   socket.on('cards:dealt', (hand) => {
//     machine.send({ type: 'CARDS_DEALT', cards: hand.cards })
//   })

//   machine.subscribe((state) => { /* → view */ })
// }
