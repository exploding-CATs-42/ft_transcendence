import type { WaitingPlayerView, WaitingStateView } from "./views";

export interface PlayerIdPayload {
  playerId: string;
}

export interface PlayerJoinedPayload {
  player: WaitingPlayerView;
}

export interface CountdownStartedPayload {
  endsAt: number;
}

export interface WaitingStatePayload {
  waitingState: WaitingStateView;
}
