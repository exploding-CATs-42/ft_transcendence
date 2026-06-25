import { type PlayerEvent } from "../events";
import type { MyContext } from "./context";

interface MyGuardArgs {
  context: MyContext;
  event: PlayerEvent;
}

const hasCards = ({ context, event: _ }: MyGuardArgs) => {
  if (context.cards.length > 0) return true;
  return false;
};

export default {
  hasCards,
};
