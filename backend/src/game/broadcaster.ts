import { Server } from "socket.io";
import { GameId, PublicEventType } from "../types";
import { Actor } from "xstate";
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
    io!.to(gameId).emit(PublicEventType.GAME_STARTED);
  });

  actor.on(GameEmitters.COUNTDOWN_STARTED, (event) => {
    io!
      .to(gameId)
      .emit(PublicEventType.COUNTDOWN_STARTED, { endsAt: event.endsAt });
  });

  actor.on(GameEmitters.COUNTDOWN_CANCELED, () => {
    io!.to(gameId).emit(PublicEventType.COUNTDOWN_CANCELED);
  });
}
