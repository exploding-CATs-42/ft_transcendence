import { TurnState } from "./turn";
import { CardInstance } from "./card";

export const GameStatus = {
  LOBBY: "LOBBY",
  PLAYING: "PLAYING",
  FINISHED: "FINISHED",
} as const;

export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

export type GameId = string;

export type GameId = string;

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

export interface Deck {
  drawPile: CardInstance[];
  discardPile: CardInstance[];
}

export interface Player {
  playerId: string;
  displayName: string;
  hand: CardInstance[];
  isAlive: boolean;
  turnOrder: number;
}

export interface GameState {
  gameId: GameId;
  status: GameStatus;
  players: Player[];
  deck: Deck;
  turn: TurnState;
  winnerId: string | null;
  rules: GameRules;
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
}
