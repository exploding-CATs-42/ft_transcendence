// Libraries
import { Socket, Server } from "socket.io";
// Project level
import { cancelStart, confirmStart, joinGame, leaveGame } from "services";
import { withErrorHandler } from "utils";
import {
  CancelStartParams,
  cancelStartSchema,
  ConfirmStartParams,
  confirmStartSchema,
  JoinGameParams,
  joinGameSchema,
  LeaveGameParams,
  leaveGameSchema,
} from "schemas";
import {
  ClientEvents,
  ErrorEventType,
  PrivateEventType,
  PublicEventType,
} from "@exploding-cats/shared-types";

export const lobbyGameHandlers = (io: Server, socket: Socket) => {
  socket.on(
    ClientEvents.JOIN_GAME,
    withErrorHandler(
      joinGameSchema,
      socket,
      ErrorEventType.JOIN_GAME_ERROR,
      async (parsed: JoinGameParams) => {
        const { waitingState, player } = await joinGame(
          parsed,
          socket.data.sub,
        );
        const room = parsed.gameId;
        await socket.join(room);

        socket.emit(PrivateEventType.WAITING_STATE, { waitingState });
        socket.to(room).emit(PublicEventType.PLAYER_JOINED, { player });
      },
    ),
  );

  socket.on(
    ClientEvents.LEAVE_GAME,
    withErrorHandler(
      leaveGameSchema,
      socket,
      ErrorEventType.LEAVE_GAME_ERROR,
      async (parsed: LeaveGameParams) => {
        const { playerId } = await leaveGame(parsed, socket.data.sub);
        const room = parsed.gameId;
        await socket.leave(room);

        socket.emit(PrivateEventType.LEFT_GAME);
        io.to(room).emit(PublicEventType.PLAYER_LEFT, { playerId });
      },
    ),
  );

  socket.on(
    ClientEvents.CONFIRM_START,
    withErrorHandler(
      confirmStartSchema,
      socket,
      ErrorEventType.CONFIRM_START_ERROR,
      async (parsed: ConfirmStartParams) => {
        const { playerId } = await confirmStart(parsed, socket.data.sub);
        const room = parsed.gameId;

        io.to(room).emit(PublicEventType.PLAYER_CONFIRMED, { playerId });
      },
    ),
  );

  socket.on(
    ClientEvents.CANCEL_START,
    withErrorHandler(
      cancelStartSchema,
      socket,
      ErrorEventType.CANCEL_START_ERROR,
      async (parsed: CancelStartParams) => {
        const { playerId } = await cancelStart(parsed, socket.data.sub);
        const room = parsed.gameId;

        io.to(room).emit(PublicEventType.PLAYER_CANCELED, { playerId });
      },
    ),
  );
};
