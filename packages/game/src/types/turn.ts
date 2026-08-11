import { type Card } from "./card";

export interface NopeWindow {
  cards: Card[];
  lastPlayerId: string;
  nopeCount: number;
  endsAt: number;
}

export const PendingActionType = {
  ATTACK: "ATTACK",
  SKIP: "SKIP",
  FAVOR: "FAVOR",
  SHUFFLE: "SHUFFLE",
  SEE_THE_FUTURE: "SEE_THE_FUTURE",
  CAT_PAIR: "CAT_PAIR",
  CAT_TRIPLE: "CAT_TRIPLE",
} as const;

export type PendingActionType =
  (typeof PendingActionType)[keyof typeof PendingActionType];
