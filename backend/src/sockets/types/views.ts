// Project level
import {
  CardInstance,
  FavorState,
  NopeChain,
  PendingAction,
  TurnPhase,
} from "game/types";

export interface PublicGameView {
  gameId: string;
  turn: PublicTurnView;
  players: PublicPlayerView[];
  deckSize: number;
  discardPileTop: CardInstance | null;
  winnerId: string | null;
}

export interface PublicTurnView {
  currentPlayerId: string;
  phase: TurnPhase;
  attackCount: number;
  isUnderAttack: boolean;
  pendingAction: PendingAction | null;
  nopeChain: NopeChain | null;
  favorState: FavorState | null;
  turnNumber: number;
}

export interface PublicPlayerView {
  id: string;
  name: string;
  handSize: number;
  isAlive: boolean;
  turnOrder: number;
}

export interface WaitingPlayerView {
  id: string;
  name: string;
  isConfirmed: boolean;
}

export interface WaitingStateView {
  players: WaitingPlayerView[];
}
