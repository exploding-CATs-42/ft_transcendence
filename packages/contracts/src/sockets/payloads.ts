import type { Card } from "@exploding-cats/game-core";
import type {
  GamePlayerView,
  WaitingPlayerView,
  WaitingStateView,
} from "./views";

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

export interface GameStartedPayload {
  players: GamePlayerView[];
  hand: Card[];
}
