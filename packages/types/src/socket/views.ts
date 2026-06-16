export interface PublicPlayerView {
  id: string;
  name: string;
  handSize: number;
  isAlive: boolean;
  turnOrder: number;
}

export interface WaitingPlayerView {
  id: string;
  isConfirmed: boolean;
}

export interface WaitingStateView {
  players: WaitingPlayerView[];
}
