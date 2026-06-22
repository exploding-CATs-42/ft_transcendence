// Local level
import type { PlayerContext, MyContext } from "./context";
import type { PlayerEvent } from "./events";
import me from "./me";
import opponent from "./opponent";

export interface PlayerStrategy<TContext> {
  guards: {
    hasCards: (args: { context: TContext; event: PlayerEvent }) => boolean;
  };
  actions: {
    playCard: (args: {
      context: TContext;
      event: PlayerEvent;
    }) => Partial<TContext>;
  };
}

function isMe(ctx: PlayerContext): ctx is MyContext {
  return ctx.role === "me";
}

export function getStrategy(
  context: PlayerContext,
): PlayerStrategy<PlayerContext> {
  if (isMe(context)) {
    return me as unknown as PlayerStrategy<PlayerContext>;
  }
  return opponent as unknown as PlayerStrategy<PlayerContext>;
}
