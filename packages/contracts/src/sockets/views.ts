export interface PlayerView {
  id: string;
  name: string;
  avatarUrl: string | null;
  isConnected: boolean;
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
