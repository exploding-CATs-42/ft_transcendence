// Project level
import { WaitingPlayerView } from "@exploding-cats/shared-types";
// Local level
import { Player } from "game/types";

export const toWaitingPlayerView = (p: Player): WaitingPlayerView => ({
  id: p.id,
  name: p.name,
  isConfirmed: p.isConfirmed,
});
