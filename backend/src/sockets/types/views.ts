// Project level
import {
  Card,
  FavorState,
  NopeChain,
  PendingAction,
  TurnPhase,
} from "game/types";
import { PublicPlayerView } from "@exploding-cats/contracts";

export interface PublicGameView {
  gameId: string;
  turn: PublicTurnView;
  players: PublicPlayerView[];
  deckSize: number;
  discardPileTop: Card | null;
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
