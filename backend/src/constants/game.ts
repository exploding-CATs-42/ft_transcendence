import { Player } from "../game/types";
import {
  Deck,
  GameId,
  GameRules,
  GameState,
  GameStatus,
  TurnState,
} from "../types";

export const DEFAULT_GAME_RULES: GameRules = {
  dealtCardsPerPlayer: 7,
  defusesDealtPerPlayer: 1,
  maxDefusesShuffledBack: 2,
  totalDefuses: 6,
  seeTheFutureCount: 3,
  minPlayers: 2,
  maxPlayers: 5,
  fasterVariantRemoveFraction: 0.3,
  nopeWindowMs: 5000,
};

export const DEFAULT_DECK: Deck = {
  drawPile: [],
  discardPile: [],
};

export const DEFAULT_PLAYER: Player = {
  id: "",
  name: "",
  hand: [],
  isConfirmed: false,
  isAlive: true,
  turnOrder: 0,
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
  finishedAt: null,
};

export const MIN_PLAYERS = 2;
export const START_GAME_COUNTDOWN_MS = 10000;
