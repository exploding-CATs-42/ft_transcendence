// Libraries
import { assign } from "xstate";
// Local level
import type { PlayerEvent } from "../events";
import type { OpponentContext } from "./context";

interface OpponentActionArgs {
  context: OpponentContext;
  event: PlayerEvent;
}

const addCard = assign(({ context, event: _ }: OpponentActionArgs) => {
  return {
    cardCount: context.cardCount + 1,
  };
});

export default {
  addCard,
};
