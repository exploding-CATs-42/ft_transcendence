import {
  LobbyGameRemovedPayload,
  LobbyGameUpdatedPayload,
  ServerPublicEvents,
} from "@exploding-cats/contracts";
import { GameRepository, toGameRecord } from "data";
import type { GameId } from "data/types";
import { io } from "../../app";

export function broadcastLobbyGameChanged(gameId: GameId) {
  const game = GameRepository.getGame(gameId);

  if (!game) {
    const payload: LobbyGameRemovedPayload = { gameId };

    io.emit(ServerPublicEvents.LOBBY_GAME_REMOVED, payload);
    return;
  }

  const payload: LobbyGameUpdatedPayload = { game: toGameRecord(game) };

  io.emit(ServerPublicEvents.LOBBY_GAME_UPDATED, payload);
}
