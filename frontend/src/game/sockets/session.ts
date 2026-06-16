import { socket } from "../../web/socket/client";

let gameId = "";

export const setGameId = (id: string) => {
  gameId = id;
};

export const emit = (event: string, payload: object = {}) =>
  socket.emit(event, { ...payload, gameId });
