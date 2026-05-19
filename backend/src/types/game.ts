import { TurnState } from "./turn";
import { CardInstance } from "./card";

export const GameStatus = {
  LOBBY: "LOBBY",
  PLAYING: "PLAYING",
  FINISHED: "FINISHED",
} as const;

export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

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

export const DEFAULT_GAME_RULES: GameRules = {
  dealtCardsPerPlayer: 7,
  defusesDealtPerPlayer: 1,
  maxDefusesShuffledBack: 2,
  totalDefuses: 6,
  seeTheFutureCount: 3,
  minPlayers: 2,
  maxPlayers: 5,
  fasterVariantRemoveFraction: 0.3,
  nopeWindowMs: 5000
};

export const DEFAULT_DECK: Deck = {
  drawPile: [],
  discardPile: []
};

export const DEFAULT_PLAYER: Player = {
  playerId: "",
  displayName: "",
  hand: [],
  isAlive: true,
  turnOrder: 0
};

export const DEFAULT_GAME_STATE: GameState = {
  gameId: "" as GameId,
  status: "waiting" as GameStatus,
  name: "",
  maxPlayers: DEFAULT_GAME_RULES.maxPlayers,
  players: [],
  deck: DEFAULT_DECK,
  turn: {} as TurnState,
  winnerId: null,
  rules: DEFAULT_GAME_RULES,
  createdAt: Date.now(),
  startedAt: null,
  finishedAt: null
};
