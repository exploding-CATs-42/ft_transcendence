export interface PlayerView {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface GamePlayerView extends PlayerView {
  isAlive: boolean;
}

export interface WaitingPlayerView extends PlayerView {
  isConfirmed: boolean;
}

export interface WaitingStateView {
  players: WaitingPlayerView[];
}
