import type { PlayerContext } from "../context";
import type { PlayerEvent } from "../events";

export interface PlayerActionArgs {
  context: PlayerContext;
  event: PlayerEvent;
}
