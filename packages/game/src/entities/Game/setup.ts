// Libraries
import { setup } from "xstate";
// Local level
import { GameContext } from "./context";
import { GameEvent, GameOutEvent } from "./events";
import actions from "./actions";
import guards from "./guards";

export const gameSetup = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
    emitted: {} as GameOutEvent,
  },
  actions: actions,
  guards: guards,
});
