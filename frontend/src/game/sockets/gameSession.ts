// Libraries
import type { Socket } from "socket.io-client";
// Project level
import { socket } from "socket";
import { ClientEvents } from "@exploding-cats/contracts";

let gameId = "";

export const setGameId = (id: string) => {
  gameId = id;
};

export const emit = (event: string, payload: object = {}) =>
  socket.emit(event, { ...payload, gameId });

export function connectToGameSession(socket: Socket, gameId: string) {
  const join = () => socket.emit(ClientEvents.JOIN_GAME, { gameId });
  if (socket.connected) join();
  socket.on("connect", join);
  return () => {
    socket.emit(ClientEvents.LEAVE_GAME, { gameId });
    socket.off("connect", join);
  };
}
