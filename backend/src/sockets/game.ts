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

export const lobbyGameHandlers = (io: Server, socket: Socket) => {
  socket.on(
    "join-table",
    withErrorHandler(
      joinGameSchema,
      socket,
      "join-table-error",
      async (parsed: JoinGameParams) => {
        const res = await joinGame(parsed, socket.data.sub);
        await socket.join(parsed.gameId);

        io.to(parsed.gameId).emit("join-table-response", res);
      },
    ),
  );

  socket.on(
    "leave-table",
    withErrorHandler(
      leaveGameSchema,
      socket,
      "leave-table-error",
      async (parsed: LeaveGameParams) => {
        const res = await leaveGame(parsed, socket.data.sub);
        await socket.leave(parsed.gameId);

        socket.emit("leave-table-response", res);
        socket.to(parsed.gameId).emit("leave-table-response", res);
      },
    ),
  );
};
