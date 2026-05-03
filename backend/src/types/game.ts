import { TurnState } from "./turn";
import { CardInstance } from "./card";

export enum GameStatus {
  LOBBY = "LOBBY",
  PLAYING = "PLAYING",
  FINISHED = "FINISHED"
}

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
  gameId: string;
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

export interface GameLobby {
  gameId: string;
  name: string;
  status: GameStatus;
  players: string[];
  createdAt: number;
}
