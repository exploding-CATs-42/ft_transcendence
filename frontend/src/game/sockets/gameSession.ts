import { ClientEvents } from "@exploding-cats/shared-types";
import type { Socket } from "socket.io-client";

export function connectToGameSession(socket: Socket, gameId: string) {
  const join = () => socket.emit(ClientEvents.JOIN_GAME, { gameId });
  if (socket.connected) join();
  socket.on("connect", join);
  return () => {
    socket.emit(ClientEvents.LEAVE_GAME, { gameId });
    socket.off("connect", join);
  };
}
