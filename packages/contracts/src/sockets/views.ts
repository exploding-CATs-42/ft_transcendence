import { PlayerStatus } from "@exploding-cats/game-core";

export interface PlayerView {
  id: string;
  name: string;
  avatarUrl: string | null;
  isConnected: boolean;
  status: PlayerStatus;
}

export interface GamePlayerView extends PlayerView {
  isAlive: boolean;
}

export interface PublicPlayerView extends GamePlayerView {
  handSize: number;
}

export interface WaitingPlayerView extends PlayerView {
  isConfirmed: boolean;
}

export interface WaitingStateView {
  players: WaitingPlayerView[];
}
