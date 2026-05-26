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
import { createEmitters } from "../game/emitters";

export const lobbyGameHandlers = (io: Server, socket: Socket) => {
  socket.on(
    ClientEventType.JOIN_GAME,
    withErrorHandler(
      joinGameSchema,
      socket,
      ErrorEventType.JOIN_GAME_ERROR,
      async (parsed: JoinGameParams) => {
        const waitingState = await joinGame(parsed, socket.data.sub);
        const room = parsed.gameId;
        await socket.join(room);

        const emitters = createEmitters(io, room);
        emitters.emitToRoom(PublicEventType.PLAYER_JOINED, waitingState);
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
        const waitingState = await leaveGame(parsed, socket.data.sub);
        const room = parsed.gameId;
        await socket.leave(room);

        const emitters = createEmitters(io, room);
        emitters.emitToRoom(PublicEventType.PLAYER_LEFT, waitingState);
      },
    ),
  );
};
