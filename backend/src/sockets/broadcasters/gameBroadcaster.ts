// Project level
import {
  CountdownStartedPayload,
  ServerPublicEvents,
} from "@exploding-cats/shared-types";
import { Game } from "data/types";
import { GameOutEvents } from "game";
import { io } from "../../app";

export function attachGameBroadcaster(game: Game) {
  const { instance: broadcaster, id: gameId } = game;

  broadcaster.on(GameOutEvents.GAME_STARTED, () => {
    io.to(gameId).emit(ServerPublicEvents.GAME_STARTED);
  });

  broadcaster.on(GameOutEvents.COUNTDOWN_STARTED, (event) => {
    const payload: CountdownStartedPayload = { endsAt: event.endsAt };

    io.to(gameId).emit(ServerPublicEvents.COUNTDOWN_STARTED, payload);
  });

  broadcaster.on(GameOutEvents.COUNTDOWN_CANCELED, () => {
    io.to(gameId).emit(ServerPublicEvents.COUNTDOWN_CANCELED);
  });
}
