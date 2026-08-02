import {
  LobbyGameRemovedPayload,
  LobbyGameUpdatedPayload,
  ServerPublicEvents,
} from "@exploding-cats/contracts";
import { GameStates } from "@exploding-cats/game-core";
import { GameRepository, toGameRecord } from "data";
import type { Game, GameId } from "data/types";
import { io } from "../../app";

function isWaitingForPlayers(game: Game) {
  return game.instance.getSnapshot().matches(GameStates.WAITING);
}

export function broadcastLobbyGameRemoved(gameId: GameId) {
  const payload: LobbyGameRemovedPayload = { gameId };

  io.emit(ServerPublicEvents.LOBBY_GAME_REMOVED, payload);
}

export function broadcastLobbyGameChanged(gameId: GameId) {
  const game = GameRepository.getGame(gameId);

  // The lobby only lists games that can still be joined, so a game that is gone
  // or already started must be dropped from it instead of being updated.
  if (!game || !isWaitingForPlayers(game)) {
    broadcastLobbyGameRemoved(gameId);
    return;
  }

  const payload: LobbyGameUpdatedPayload = { game: toGameRecord(game) };

  io.emit(ServerPublicEvents.LOBBY_GAME_UPDATED, payload);
}
