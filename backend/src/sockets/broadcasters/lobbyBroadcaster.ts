import { ServerPublicEvents } from "@exploding-cats/contracts";
import { io } from "../../app";

export function broadcastLobbyGamesUpdated() {
  io.emit(ServerPublicEvents.LOBBY_GAMES_UPDATED);
}
