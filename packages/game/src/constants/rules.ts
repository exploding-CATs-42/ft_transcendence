// Local level
import type { GameRules } from "../types";

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;

export const DEFAULT_GAME_RULES: GameRules = {
  dealtCardsPerPlayer: 7,
  defusesDealtPerPlayer: 1,
};
