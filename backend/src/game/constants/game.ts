// Local level
import { GameRules } from "game/types";

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

export const MIN_PLAYERS = 2;
export const START_GAME_COUNTDOWN_MS = 10000;
