// Libraries
import { assign } from "xstate";
// Local level
import type { PlayerEvent } from "../events";
import type { OpponentContext } from "./context";

interface OpponentActionArgs {
  context: OpponentContext;
  event: PlayerEvent;
}

/*
Action - is a function that takes as arguments:
- machine context 
- and the event that triggered it

and usually performs some context mutations
*/

const addCard = assign(({ context, event: _ }: OpponentActionArgs) => {
  return {
    cardCount: context.cardCount + 1,
  };
});

export default {
  addCard,
};
