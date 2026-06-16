// Project level
import {
  CountdownStartedPayload,
  ServerPublicEvents,
} from "@exploding-cats/shared-types";
import { Game } from "data/types";
import { GameOutEvents } from "game/events";
import { io } from "../../app";

export function attachBroadcasters(game: Game) {
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

// broadcaster - is a function that just repeats/broadcasts events
// emitted by the machine to the outside world. it's as simple/stupid as a parrot
// it hears something - it repeats/broadcasts it

// broadcaster example
// broadcaster.on(GameOutEvents.PLAYER_ADDED, (event: GameOutEvent) => {
//     io.to(gameId).emit(ServerPublicEvents.PLAYER_ADDED, {playerId: event.playerId});
// });
