// Libraries
import { Socket, Server } from "socket.io";
// Project level
import { confirmStart, joinGame, leaveGame } from "../services/gameService";
import { withErrorHandler } from "../utils/asyncHandler";
import {
  ConfirmStartParams,
  confirmStartSchema,
  JoinGameParams,
  joinGameSchema,
  LeaveGameParams,
  leaveGameSchema,
} from "../schemas/games";
import {
  ClientEventType,
  ErrorEventType,
  PrivateEventType,
  PublicEventType,
} from "../types";

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

        io.to(room).emit(PublicEventType.PLAYER_JOINED, waitingState);
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

        socket.emit(PrivateEventType.YOU_LEFT);
        io.to(room).emit(PublicEventType.PLAYER_LEFT, waitingState);
      },
    ),
  );

  socket.on(
    ClientEventType.CONFIRM_START,
    withErrorHandler(
      confirmStartSchema,
      socket,
      ErrorEventType.CONFIRM_START_ERROR,
      async (parsed: ConfirmStartParams) => {
        const waitingState = await confirmStart(parsed, socket.data.sub);
        const room = parsed.gameId;

        io.to(room).emit(PublicEventType.PLAYER_CONFIRMED, waitingState);
      },
    ),
  );
};
