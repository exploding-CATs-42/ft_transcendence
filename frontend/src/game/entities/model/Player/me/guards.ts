import type { MyContext } from "./context";
// import { PlayerEvents, type PlayerEvent } from "./events";

const hasCards = (context: MyContext) => {
  if (context.cards.length > 0) return true;
  return false;
};

export default {
  hasCards,
};
