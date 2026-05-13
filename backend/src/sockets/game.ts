import { Server, Socket } from "socket.io";
import { createGameRoom, GameRoom } from "../game/room/gameRoom";

interface StartGameData {
  gameId: string;
  players: { playerId: string; displayName: string; socketId: string }[];
}

const rooms: Record<string, GameRoom> = {};

export const registerGameHandlers = (io: Server, socket: Socket) => {
  socket.on("start_game", (data: StartGameData) => {
    if (rooms[data.gameId]) return;
    rooms[data.gameId] = createGameRoom({
      io,
      gameId: data.gameId,
      players: data.players,
      deckSize: 20,
      cardsPerPlayer: 5
    });
  });
};
