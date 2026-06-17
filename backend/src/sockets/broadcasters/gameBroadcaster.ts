// Libraries
import { Actor } from "xstate";
// Project level
import {
  CountdownStartedPayload,
  ServerPublicEvents,
} from "@exploding-cats/shared-types";
import { GameId } from "data/types";
import { gameMachine, GameOutEvents } from "game";
import { io } from "../../app";

export function attachGameBroadcaster(
  gameId: GameId,
  actor: Actor<typeof gameMachine>,
) {
  actor.on(GameOutEvents.GAME_STARTED, () => {
    io.to(gameId).emit(ServerPublicEvents.GAME_STARTED);
  });

  actor.on(GameOutEvents.COUNTDOWN_STARTED, (event) => {
    const payload: CountdownStartedPayload = { endsAt: event.endsAt };

    io.to(gameId).emit(ServerPublicEvents.COUNTDOWN_STARTED, payload);
  });

  actor.on(GameOutEvents.COUNTDOWN_CANCELED, () => {
    io.to(gameId).emit(ServerPublicEvents.COUNTDOWN_CANCELED);
  });
}
