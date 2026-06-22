import type { PlayerEvent } from "../events";
import type { OpponentContext } from "./context";

interface OpponentActionArgs {
  context: OpponentContext;
  event: PlayerEvent;
}

const playCard = ({ context, event: _ }: OpponentActionArgs) => {
  return {
    cardCount: context.cardCount - 1,
  };
};

export default {
  playCard,
};
