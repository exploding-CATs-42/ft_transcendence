import { PlayerEvents, type PlayerEvent } from "../events";
import type { MyContext } from "./context";

interface MyActionArgs {
  context: MyContext;
  event: PlayerEvent;
}

const playCard = ({ context, event }: MyActionArgs) => {
  if (event.type !== PlayerEvents.PLAY_CARD) return;

  return {
    ...context,
    cards: [...context.cards, event.card],
  };
};

export default {
  playCard,
};
