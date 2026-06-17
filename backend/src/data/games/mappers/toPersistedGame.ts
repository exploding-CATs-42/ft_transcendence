import { Game, PersistedGame } from "../types";

export function toPersistedGame(game: Game): PersistedGame {
  const { instance, ...record } = game;

  return {
    metadata: record,
    snapshot: instance.getPersistedSnapshot(),
  };
}
