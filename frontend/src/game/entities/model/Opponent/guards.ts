import type {
  OpponentGuardImplementation,
  OpponentGuard,
  OpponentGuardArgs,
} from "./types";

/*
Guard - is a function that takes as arguments:
- machine context 
- and the event that triggered it

and performs a check if an transition/action is allowed to be executed
*/

export const OpponentGuards = {
  HAS_CARDS: "hasCards",
} as const;

export const hasCards = ({ context, event: _ }: OpponentGuardArgs) => {
  if (context.cardCount > 0) return true;
  return false;
};

export default {
  [OpponentGuards.HAS_CARDS]: hasCards,
} satisfies Record<OpponentGuard, OpponentGuardImplementation>;
