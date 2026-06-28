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
Wrapping each action inside an assign() call allows me to do:

return playerMachine.provide({
  guards: strategy.guards,
  actions: strategy.actions,
});

inside of `factory.ts`.
Otherwise I'd have to do:

playerMachine.provide({
  guards: strategy.guards,
  actions: {
    [PlayerActions.ADD_CARD]: assign(strategy.actions.addCard) },
    // and so on for each of the actions
  }
});
*/

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
