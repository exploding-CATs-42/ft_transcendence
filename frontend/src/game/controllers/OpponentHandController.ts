import {
  OpponentEvents,
  OpponentOutEvents,
  type OpponentInstance,
} from "game/entities/model";
import { OpponentHand } from "game/entities/graphic";

export class OpponentHandController {
  #machine: OpponentInstance;
  #view: OpponentHand;

  constructor(machine: OpponentInstance, view: OpponentHand) {
    this.#machine = machine;
    this.#view = view;

    this.subscribeToMachineEvents(machine);
  }

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
