// Project level
import { GamePlayerView, WaitingPlayerView } from "@exploding-cats/contracts";
import { Player } from "@exploding-cats/game-core";

export const toWaitingPlayerView = (p: Player): WaitingPlayerView => ({
  id: p.id,
  name: p.name,
  avatarUrl: p.avatarUrl,
  isConfirmed: p.isConfirmed,
});

export const toGamePlayerView = (p: Player): GamePlayerView => ({
  id: p.id,
  name: p.name,
  avatarUrl: p.avatarUrl,
  isAlive: p.isAlive,
});
