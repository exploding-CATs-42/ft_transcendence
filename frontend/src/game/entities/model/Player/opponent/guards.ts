import type { PlayerEvent } from "../events";
import type { OpponentContext } from "./context";

interface OpponentGuardArgs {
  context: OpponentContext;
  event: PlayerEvent;
}

const hasCards = ({ context, event: _ }: OpponentGuardArgs) => {
  if (context.cardCount > 0) return true;
  return false;
};

export default {
  hasCards,
};
