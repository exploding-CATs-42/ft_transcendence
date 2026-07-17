// Libraries
import type { Socket } from "socket.io-client";
import { toast } from "react-toastify";
// Project level
import { socket } from "socket";
import {
  ClientEvents,
  ServerErrorEvents,
  SocketErrorCodes,
  type SocketErrorPayload,
} from "@exploding-cats/contracts";

let gameId = "";

export const setGameId = (id: string) => {
  gameId = id;
};

export const emit = (event: string, payload: object = {}) =>
  socket.emit(event, { ...payload, gameId });

export const leaveGame = () => {
  emit(ClientEvents.LEAVE_GAME);
};

export function connectToGameSession(
  socket: Socket,
  gameId: string,
  onFatalError: () => void,
) {
  const join = () => socket.emit(ClientEvents.JOIN_GAME, { gameId });
  const reconnect = () => socket.emit(ClientEvents.RECONNECT_GAME, { gameId });
  const onJoinGameError = ({ code, message }: SocketErrorPayload) => {
    if (code === SocketErrorCodes.RECONNECT_REQUIRED) {
      reconnect();
      return;
    }

    // Any other join error means we can't stay on this page: game doesn't exist, is full, already running, etc.
    toast(message);
    onFatalError();
  };
  if (socket.connected) join();
  socket.on("connect", join);
  socket.on(ServerErrorEvents.JOIN_GAME_ERROR, onJoinGameError);
  return () => {
    socket.off("connect", join);
    socket.off(ServerErrorEvents.JOIN_GAME_ERROR, onJoinGameError);
  };
}
