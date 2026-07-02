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

export interface CardPlayedPayload {
  playerId: string;
  cardType: string;
  actionId: string;
  nopeWindowExpiresAt: number;
}

export const CardRemovalReason = {
  PLAYED: "PLAYED",
  STOLEN: "STOLEN",
  GIVEN_AWAY: "GIVEN_AWAY",
  EXPLODED: "EXPLODED",
} as const;

export type CardRemovalReason =
  (typeof CardRemovalReason)[keyof typeof CardRemovalReason];

export interface CardRemovedPayload {
  cardId: string;
  reason: CardRemovalReason;
}
