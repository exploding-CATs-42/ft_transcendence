import type { WaitingPlayerView, WaitingStateView } from "./views";
import { Card } from "../game";

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

export interface Hand {
  playerId: string;
  cards: Card[];
}
