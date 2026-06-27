// Libraries
import { assign } from "xstate";
// Local level
import type {
  OpponentActionImplementation,
  OpponentAction,
  OpponentActionArgs,
} from "./types";

/*
Action - is a function that takes as arguments:
- machine context 
- and the event that triggered it

and usually performs some context mutations
*/

export const OpponentActions = {
  ADD_CARD: "addCard",
} as const;

export const addCard = ({ context, event: _ }: OpponentActionArgs) => {
  return {
    cardCount: context.cardCount + 1,
  };
};

export default {
  [OpponentActions.ADD_CARD]: assign(addCard),
} satisfies Record<OpponentAction, OpponentActionImplementation>;
