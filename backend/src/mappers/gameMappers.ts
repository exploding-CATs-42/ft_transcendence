// Project level
import {
  PlayerView,
  GameStartedPayload,
  PublicPlayerView,
  WaitingPlayerView,
} from "@exploding-cats/contracts";
import { Player, PlayerStatus } from "@exploding-cats/game-core";
import { isUserOnline } from "sockets/onlineUsers";

export const toWaitingPlayerView = (p: Player): WaitingPlayerView => ({
  id: p.id,
  name: p.name,
  avatarUrl: p.avatarUrl,
  isConfirmed: p.isConfirmed,
  isConnected: isUserOnline(p.id),
  status: PlayerStatus.WAITING,
});

export const toPlayerView = (p: Player): PlayerView => ({
  id: p.id,
  name: p.name,
  avatarUrl: p.avatarUrl,
  status: p.status,
  isConnected: isUserOnline(p.id),
});

export const toPublicPlayerView = (p: Player): PublicPlayerView => ({
  ...toPlayerView(p),
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
