import type {
  GuardImplementation,
  PlayerGuard,
  PlayerGuardArgs,
} from "./types";

/*
Guard - is a function that takes as arguments:
- machine context 
- and the event that triggered it

and performs a check if an transition/action is allowed to be executed
*/

export const PlayerGuards = {
  HAS_CARDS: "hasCards",
} as const;

export const hasCards = ({ context, event: _ }: PlayerGuardArgs) => {
  if (context.cards.length > 0) return true;
  return false;
};

export default {
  [PlayerGuards.HAS_CARDS]: hasCards,
} satisfies Record<PlayerGuard, GuardImplementation>;
