import type { OpponentContext } from "./context";

const hasCards = (context: OpponentContext) => {
  if (context.cardCount > 0) return true;
  return false;
};

export default {
  hasCards,
};
