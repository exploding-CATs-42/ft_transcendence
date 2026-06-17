// Libraries
import type { Socket } from "socket.io-client";
// Project level
import { ClientEvents } from "@exploding-cats/shared-types";

export function connectToGameSession(socket: Socket, gameId: string) {
  const join = () => socket.emit(ClientEvents.JOIN_GAME, { gameId });
  if (socket.connected) join();
  socket.on("connect", join);
  return () => {
    socket.emit(ClientEvents.LEAVE_GAME, { gameId });
    socket.off("connect", join);
  };
}
