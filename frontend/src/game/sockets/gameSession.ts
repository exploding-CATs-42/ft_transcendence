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
import { GAME_SESSION_ERROR_EVENTS } from "./errorEvents";

let gameId = "";

export const setGameId = (id: string) => {
  gameId = id;
};

export const emit = (event: string, payload: object = {}) =>
  socket.emit(event, { ...payload, gameId });

export const leaveGame = () => {
  emit(ClientEvents.LEAVE_GAME);
};

export const syncGameState = () => emit(ClientEvents.RECONNECT_GAME);

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
  const onGameSessionError = ({ message }: SocketErrorPayload) => {
    toast(message);
  };

  if (socket.connected) join();
  socket.on("connect", join);
  socket.on(ServerErrorEvents.JOIN_GAME_ERROR, onJoinGameError);
  GAME_SESSION_ERROR_EVENTS.forEach((event) => {
    socket.on(event, onGameSessionError);
  });

  return () => {
    socket.off("connect", join);
    socket.off(ServerErrorEvents.JOIN_GAME_ERROR, onJoinGameError);
    GAME_SESSION_ERROR_EVENTS.forEach((event) => {
      socket.off(event, onGameSessionError);
    });
  };
}
