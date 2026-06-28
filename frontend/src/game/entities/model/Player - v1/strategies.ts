// Libraries
import type { MachineImplementationsFrom } from "xstate";
// Local level
import type { playerMachine } from "./playerMachine";
import type { PlayerContext, MyContext } from "./context";
import me from "./me";
import opponent from "./opponent";

type PlayerImplementations = MachineImplementationsFrom<typeof playerMachine>;

export interface PlayerStrategy {
  guards: NonNullable<PlayerImplementations["guards"]>;
  actions: NonNullable<PlayerImplementations["actions"]>;
}

function isMe(ctx: PlayerContext): ctx is MyContext {
  return ctx.role === "me";
}

export function getStrategy(context: PlayerContext): PlayerStrategy {
  if (isMe(context)) return me as unknown as PlayerStrategy;
  return opponent as unknown as PlayerStrategy;
}
