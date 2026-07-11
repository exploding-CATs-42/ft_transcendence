// Project level
import {
  GamePlayerView,
  GameStartedPayload,
  PublicPlayerView,
  WaitingPlayerView,
} from "@exploding-cats/contracts";
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

export const toPublicPlayerView = (p: Player): PublicPlayerView => ({
  ...toGamePlayerView(p),
  handSize: p.hand.length,
});

export const toGameStartedPayload = (
  players: Player[],
  playerId: string,
  deckSize: number,
): GameStartedPayload => {
  const playerIndex = players.findIndex((player) => player.id === playerId);
  const orderedPlayers = [
    ...players.slice(playerIndex),
    ...players.slice(0, playerIndex),
  ];

  return {
    players: orderedPlayers.map((player) => toPublicPlayerView(player)),
    hand: players[playerIndex]!.hand,
    deckSize,
  };
};
