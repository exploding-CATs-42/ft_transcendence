// Project level
import { WaitingPlayerView } from "@exploding-cats/contracts";
import { Player } from "game/types";

export const toWaitingPlayerView = (p: Player): WaitingPlayerView => ({
  id: p.id,
  name: p.name,
  avatarUrl: p.avatarUrl,
  isConfirmed: p.isConfirmed,
});
