// Libraries
import type { Socket } from "socket.io-client";
// Project level
import { socket } from "socket";
import { ClientEvents, ServerErrorEvents } from "@exploding-cats/contracts";

let gameId = "";
let isLeavingGame = false;
const GAME_ALREADY_IN_PROGRESS_MESSAGE = "Game is already in progress";

interface SocketErrorPayload {
  message: string;
}

export const setGameId = (id: string) => {
  gameId = id;
  isLeavingGame = false;
};

export const emit = (event: string, payload: object = {}) =>
  socket.emit(event, { ...payload, gameId });

export const leaveGame = () => {
  isLeavingGame = true;
  emit(ClientEvents.LEAVE_GAME);
};

export function connectToGameSession(socket: Socket, gameId: string) {
  const join = () => socket.emit(ClientEvents.JOIN_GAME, { gameId });
  const reconnect = () => socket.emit(ClientEvents.RECONNECT_GAME, { gameId });
  const onJoinGameError = ({ message }: SocketErrorPayload) => {
    if (message === GAME_ALREADY_IN_PROGRESS_MESSAGE) reconnect();
  };
  if (socket.connected) join();
  socket.on("connect", join);
  socket.on(ServerErrorEvents.JOIN_GAME_ERROR, onJoinGameError);
  return () => {
    if (!isLeavingGame) {
      socket.emit(ClientEvents.LEAVE_GAME, { gameId });
    }
    socket.off("connect", join);
    socket.off(ServerErrorEvents.JOIN_GAME_ERROR, onJoinGameError);
  };
}
