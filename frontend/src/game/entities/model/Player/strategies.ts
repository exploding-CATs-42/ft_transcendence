// Local level
import type { OpponentContext, PlayerContext, MyContext } from "./context";
import type { PlayerActionArgs, PlayerGuardsArgs } from "./types";
import me from "./me";
import opponent from "./opponent";

interface PlayerStrategy {
  guards: {
    hasCards: (args: PlayerGuardsArgs) => boolean;
  };
  actions: {
    addCard: (args: PlayerActionArgs) => PlayerContext;
  };
}

export function isMe(ctx: PlayerContext): ctx is MyContext {
  return ctx.role === "me";
}

export function isOpponent(ctx: PlayerContext): ctx is OpponentContext {
  return ctx.role === "opponent";
}

function createMyStrategy(context: MyContext): PlayerStrategy {
  return {
    guards: me.guards,
    actions: me.actions,
  };
}

function createOpponentStrategy(context: OpponentContext): PlayerStrategy {
  return {
    guards: opponent.guards,
    actions: opponent.actions,
  };
}

export function getStrategy(context: PlayerContext): PlayerStrategy {
  return isMe(context)
    ? createMyStrategy(context)
    : createOpponentStrategy(context);
}
