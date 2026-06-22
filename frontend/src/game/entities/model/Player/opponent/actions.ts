import type { OpponentContext } from "./context";

// Actions
const addCard = (context: OpponentContext) => {
  return {
    ...context,
    cardCount: context.cardCount + 1,
  };
};

export default {
  addCard,
};
