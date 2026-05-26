// Libraries
import { Socket, Server } from "socket.io";
// Project level
import { joinGame, leaveGame } from "../services/gameService";
import { withErrorHandler } from "../utils/asyncHandler";
import {
  JoinGameParams,
  joinGameSchema,
  LeaveGameParams,
  leaveGameSchema,
} from "../schemas/games";
import { ClientEventType, ErrorEventType, PublicEventType } from "../types";

export const lobbyGameHandlers = (io: Server, socket: Socket) => {
  socket.on(
    ClientEventType.JOIN_GAME,
    withErrorHandler(
      joinGameSchema,
      socket,
      ErrorEventType.JOIN_GAME_ERROR,
      async (parsed: JoinGameParams) => {
        const res = await joinGame(parsed, socket.data.sub);
        await socket.join(parsed.gameId);

        io.to(parsed.gameId).emit(PublicEventType.PLAYER_JOINED, res);
      },
    ),
  );

  socket.on(
    ClientEventType.LEAVE_GAME,
    withErrorHandler(
      leaveGameSchema,
      socket,
      ErrorEventType.LEAVE_GAME_ERROR,
      async (parsed: LeaveGameParams) => {
        const res = await leaveGame(parsed, socket.data.sub);
        await socket.leave(parsed.gameId);

        socket.emit(PublicEventType.PLAYER_LEFT, res);
        socket.to(parsed.gameId).emit(PublicEventType.PLAYER_LEFT, res);
      },
    ),
  );
};
