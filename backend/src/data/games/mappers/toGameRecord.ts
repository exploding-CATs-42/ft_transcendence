import { Game, GameRecord } from "../types";

export const toGameRecord = (game: Game): GameRecord => {
  const { instance: _, ...record } = game;
  return record;
};
