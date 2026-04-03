import { CardInstance, CardType } from "./card";

export enum TurnPhase {
  ACTION = "ACTION",
  NOPE_WINDOW = "NOPE_WINDOW",
  DEFUSE_PROMPT = "DEFUSE_PROMPT",
  INSERT_KITTEN = "INSERT_KITTEN",
  FAVOR_SELECT = "FAVOR_SELECT"
}

export enum PendingActionType {
  ATTACK = "ATTACK",
  SKIP = "SKIP",
  FAVOR = "FAVOR",
  SHUFFLE = "SHUFFLE",
  SEE_THE_FUTURE = "SEE_THE_FUTURE",
  CAT_PAIR = "CAT_PAIR",
  CAT_TRIPLE = "CAT_TRIPLE"
}

export interface TurnState {
  currentPlayerId: string;
  phase: TurnPhase;
  attackCount: number;
  isUnderAttack: boolean;
  pendingAction: PendingAction | null;
  nopeChain: NopeChain | null;
  favorState: FavorState | null;
  turnNumber: number;
}

export interface PendingAction {
  actionId: string;
  type: PendingActionType;
  playerId: string;
  cards: CardInstance[];
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
