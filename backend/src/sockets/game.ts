// Libraries
import { Socket, Server } from "socket.io";
// Project level
import { JoinGameParams, joinGameSchema } from "../schemas/games/joinGame";
import { joinGame } from "../services/gameService";
import { validate } from "../utils/validate";
import { withErrorHandler } from "../utils/asyncHandler";

export const lobbyGameHandlers = (io: Server, socket: Socket) => {
  socket.on(
    "join-table",
    withErrorHandler(socket, "join-table-error", async (data: unknown) => {
      const parsed: JoinGameParams = validate(joinGameSchema, data);
      const params: JoinGameParams = parsed.data;

      const res = await joinGame(params, socket.data.sub);
      await socket.join(params.gameId);

      io.to(params.gameId).emit("join-table-response", res);
    })
  );
};
