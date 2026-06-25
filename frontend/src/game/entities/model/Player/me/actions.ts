// Libraries
import { assign } from "xstate";
// Local level
import { type PlayerEvent, PlayerEvents } from "../events";
import type { MyContext } from "./context";

interface MyActionArgs {
  context: MyContext;
  event: PlayerEvent;
}

/*
Action - is a function that takes as arguments:
- machine context 
- and the event that triggered it

and usually performs some context mutations
*/

const addCard = assign(({ context, event }: MyActionArgs) => {
  const type = event.type;
  if (!(type === PlayerEvents.DRAW_CARD || type === PlayerEvents.TAKE_CARD))
    return context;

  return {
    ...context,
    cards: [...context.cards, event.card],
  };
});

export default {
  addCard,
};
