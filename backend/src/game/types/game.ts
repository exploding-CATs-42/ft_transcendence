import { TurnState } from "./turn";
import { Deck } from "./card";
import { Player } from "../types";

export type GameId = string;
export type UserId = string;

export interface GameRules {
  dealtCardsPerPlayer: number;
  defusesDealtPerPlayer: number;
  maxDefusesShuffledBack: number;
  totalDefuses: number;
  seeTheFutureCount: number;
  minPlayers: number;
  maxPlayers: number;
  fasterVariantRemoveFraction: number;
  nopeWindowMs: number;
}

export interface GameState {
  gameId: GameId;
  name: string;
  maxPlayers: number;
  players: Player[];
  deck: Deck;
  turn: TurnState;
  winnerId: string | null;
  rules: GameRules;
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
}
