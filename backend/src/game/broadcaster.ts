import { Server } from "socket.io";
import { GameId } from "../types";
import { Actor } from "xstate";
import { gameMachine } from "./gameMachine";

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

  console.log(gameId, actor);
}
