import { Server } from "socket.io";
import { GameId, PublicEventType } from "../types";
import { Actor } from "xstate";
import { gameMachine } from "./gameMachine";
import { GameEmitterType } from "./emitters";

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

  actor.on(GameEmitterType.COUNTDOWN_STARTED, (event) => {
    io!
      .to(gameId)
      .emit(PublicEventType.COUNTDOWN_STARTED, { endsAt: event.endsAt });
  });

  actor.on(GameEmitterType.COUNTDOWN_CANCELED, () => {
    io!.to(gameId).emit(PublicEventType.COUNTDOWN_CANCELED);
  });
}
