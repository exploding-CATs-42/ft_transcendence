// Project level
import { WaitingPlayerView } from "types";
// Local level
import { Player } from "./types/player";

export const toWaitingPlayerView = (p: Player): WaitingPlayerView => ({
  id: p.id,
  name: p.name,
  isConfirmed: p.isConfirmed,
});
