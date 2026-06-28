// Libraries
import { assign } from "xstate";
// Local level
import type {
  ActionImplementation,
  PlayerAction,
  PlayerActionArgs,
} from "./types";
import { PlayerEvents } from "./events";

/*
Action - is a function that takes as arguments:
- machine context 
- and the event that triggered it

and usually performs some context mutations
*/

export const PlayerActions = {
  ADD_CARD: "addCard",
} as const;

export const addCard = ({ context, event }: PlayerActionArgs) => {
  if (event.type !== PlayerEvents.TAKE_CARD) return context;

  return {
    cards: [...context.cards, event.card],
  };
};

export default {
  [PlayerActions.ADD_CARD]: assign(addCard),
} satisfies Record<PlayerAction, ActionImplementation>;
