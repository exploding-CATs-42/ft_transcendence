// Libraries
import { Socket, Server } from "socket.io";
// Project level
import { joinGame, leaveGame } from "../services/gameService";
import { withErrorHandler } from "../utils/asyncHandler";
import { joinGameSchema } from "../schemas/games/joinGame";
import { leaveGameSchema } from "../schemas/games/leaveGame";

export const lobbyGameHandlers = (io: Server, socket: Socket) => {
  socket.on(
    "join-table",
    withErrorHandler(
      joinGameSchema,
      socket,
      "join-table-error",
      async (parsed: any) => {
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
      async (parsed: any) => {
        const res = await leaveGame(parsed, socket.data.sub);
        await socket.leave(parsed.gameId);

        socket.emit("leave-table-response", res);
        socket.to(parsed.gameId).emit("leave-table-response", res);
      },
    ),
  );
};
