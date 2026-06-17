// Libraries
import { Actor } from "xstate";
import { Server } from "socket.io";
// Project level
import {
  CountdownStartedPayload,
  ServerPublicEvents,
} from "@exploding-cats/shared-types";
import { GameId } from "data/types";
import { gameMachine, GameOutEvents } from "game";

let io: Server | null = null;

export function setIoForBroadcaster(server: Server) {
  io = server;
}

export function attachGameBroadcaster(
  gameId: GameId,
  actor: Actor<typeof gameMachine>,
) {
  if (!io) {
    throw new Error("io for broadcaster wasn't initialized.");
  }

  actor.on(GameOutEvents.GAME_STARTED, () => {
    io!.to(gameId).emit(ServerPublicEvents.GAME_STARTED);
  });

  actor.on(GameOutEvents.COUNTDOWN_STARTED, (event) => {
    const payload: CountdownStartedPayload = { endsAt: event.endsAt };

    io!.to(gameId).emit(ServerPublicEvents.COUNTDOWN_STARTED, payload);
  });

  actor.on(GameOutEvents.COUNTDOWN_CANCELED, () => {
    io!.to(gameId).emit(ServerPublicEvents.COUNTDOWN_CANCELED);
  });
}
