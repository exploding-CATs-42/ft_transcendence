// Project level
import { loadGames } from "data";
import type { Game, PersistedGame } from "data/types";
import { createGameInstance } from "game/factories";
import { GameRepository } from "data";
import { attachBroadcasters } from "./sockets/broadcasters/gameBroadcaster";

export async function restoreGames() {
  const persistedGames: PersistedGame[] = await loadGames();

  for (const persistedGame of persistedGames) {
    const { snapshot, metadata } = persistedGame;

    const instance = createGameInstance(snapshot);
    const game: Game = { ...metadata, instance };
    attachBroadcasters(game);

    GameRepository.addGame(game);
  }
}
