// Project level
import type { Game, PersistedGame } from "data/types";
import { loadGames, GameRepository } from "data";
import { createGameInstance } from "game";
import { attachGameBroadcaster } from "sockets";

export async function restoreGames() {
  const persistedGames: PersistedGame[] = await loadGames();

  for (const persistedGame of persistedGames) {
    const { snapshot, metadata } = persistedGame;

    const instance = createGameInstance(snapshot);
    const game: Game = { ...metadata, instance };
    attachGameBroadcaster(game);
    game.instance.start();

    GameRepository.addGame(game);
  }
}
