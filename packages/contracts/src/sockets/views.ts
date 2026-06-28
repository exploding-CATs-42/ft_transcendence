export interface PublicPlayerView {
  id: string;
  name: string;
  handSize: number;
  isAlive: boolean;
}

export interface WaitingPlayerView {
  id: string;
  name: string;
  avatarUrl: string | null;
  isConfirmed: boolean;
}

export interface WaitingStateView {
  players: WaitingPlayerView[];
}
