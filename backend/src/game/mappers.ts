import { WaitingPlayerView } from "../types";
import { Player } from "./types/player";

export const toWaitingPlayerView = (p: Player): WaitingPlayerView => ({
  id: p.id,
  name: p.name,
  isConfirmed: p.isConfirmed,
});
