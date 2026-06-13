// Libraries
import { Actor } from "xstate";
import { Server } from "socket.io";
// Project level
import { GameId } from "types";
import { ServerPublicEvents } from "@exploding-cats/shared-types";
// Local level
import { gameMachine } from "./gameMachine";
import { GameEmitters } from "./emitters";

let io: Server | null = null;

export function setIoForBroadcaster(server: Server) {
  io = server;
}

export function attachBroadcaster(
  gameId: GameId,
  actor: Actor<typeof gameMachine>,
) {
  if (!io) {
    throw new Error("io for broadcaster wasn't initialized.");
  }

  actor.on(GameEmitters.GAME_STARTED, () => {
    io!.to(gameId).emit(ServerPublicEvents.GAME_STARTED);
  });

  actor.on(GameEmitters.COUNTDOWN_STARTED, (event) => {
    io!
      .to(gameId)
      .emit(ServerPublicEvents.COUNTDOWN_STARTED, { endsAt: event.endsAt });
  });

  actor.on(GameEmitters.COUNTDOWN_CANCELED, () => {
    io!.to(gameId).emit(ServerPublicEvents.COUNTDOWN_CANCELED);
  });
}
