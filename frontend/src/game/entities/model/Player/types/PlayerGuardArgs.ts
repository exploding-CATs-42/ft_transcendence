import type { PlayerContext } from "../context";
import type { PlayerEvent } from "../events";

export interface PlayerGuardsArgs {
  context: PlayerContext;
  event: PlayerEvent;
}
