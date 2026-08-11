import { type Card, CardType } from "./card";

export interface NopeWindow {
  cards: Card[];
  lastPlayerId: string;
  nopeCount: number;
  endsAt: number;
}

export const TurnPhase = {
  ACTION: "ACTION",
  NOPE_WINDOW: "NOPE_WINDOW",
  DEFUSE_PROMPT: "DEFUSE_PROMPT",
  INSERT_KITTEN: "INSERT_KITTEN",
  FAVOR_SELECT: "FAVOR_SELECT",
} as const;

export type TurnPhase = (typeof TurnPhase)[keyof typeof TurnPhase];

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

export interface PendingAction {
  actionId: string;
  type: PendingActionType;
  playerId: string;
  cards: Card[];
  targetPlayerId?: string;
  namedCardType?: CardType;
  isNoped: boolean;
  nopeWindowExpiresAt: number;
}

export interface NopeEntry {
  playerId: string;
  cardInstanceId: string;
}

export interface NopeChain {
  pendingActionId: string;
  entries: NopeEntry[];
}

export interface FavorState {
  requesterId: string;
  targetPlayerId: string;
}
