import { WaitingPlayerView } from "../types";
import { Player } from "./types";

export const toWaitingPlayerView = (p: Player): WaitingPlayerView => ({
  id: p.id,
  name: p.name,
  isConfirmed: p.isConfirmed,
});
