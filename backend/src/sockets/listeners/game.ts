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
  PlayerIdPayload,
  PlayerJoinedPayload,
  ServerErrorEvents,
  ServerPrivateEvents,
  ServerPublicEvents,
  WaitingStatePayload,
} from "@exploding-cats/shared-types";

export const registerGameHandlers = (io: Server, socket: Socket) => {
  socket.on(
    ClientEvents.JOIN_GAME,
    withErrorHandler(
      joinGameSchema,
      socket,
      ServerErrorEvents.JOIN_GAME_ERROR,
      async (parsed: JoinGameParams) => {
        const userId = socket.data.sub;
        const gameId = parsed.gameId;
        const result = joinGame(userId, gameId);

        if (!result.ok) {
          socket.emit(ServerErrorEvents.JOIN_GAME_ERROR, result.error);
          return;
        }

        const room = parsed.gameId;
        await socket.join(room);

        const { waitingState, player } = result.value;
        const privatePayload: WaitingStatePayload = { waitingState };
        const publicPayload: PlayerJoinedPayload = { player };

        socket.emit(ServerPrivateEvents.WAITING_STATE, privatePayload);
        socket.to(room).emit(ServerPublicEvents.PLAYER_JOINED, publicPayload);
      },
    ),
  );

  socket.on(
    ClientEvents.LEAVE_GAME,
    withErrorHandler(
      leaveGameSchema,
      socket,
      ServerErrorEvents.LEAVE_GAME_ERROR,
      async (parsed: LeaveGameParams) => {
        const userId = socket.data.sub;
        const gameId = parsed.gameId;
        const result = leaveGame(userId, gameId);

        if (!result.ok) {
          socket.emit(ServerErrorEvents.LEAVE_GAME_ERROR, result.error);
          return;
        }

        const playerId = result.value.playerId;

        const room = parsed.gameId;
        await socket.leave(room);

        const publicPayload: PlayerIdPayload = { playerId };

        socket.emit(ServerPrivateEvents.LEFT_GAME);
        io.to(room).emit(ServerPublicEvents.PLAYER_LEFT, publicPayload);
      },
    ),
  );

  socket.on(
    ClientEvents.CONFIRM_START,
    withErrorHandler(
      confirmStartSchema,
      socket,
      ServerErrorEvents.CONFIRM_START_ERROR,
      async (parsed: ConfirmStartParams) => {
        const userId = socket.data.sub;
        const gameId = parsed.gameId;
        const result = confirmStart(userId, gameId);

        if (!result.ok) {
          socket.emit(ServerErrorEvents.CONFIRM_START_ERROR, result.error);
          return;
        }

        const room = parsed.gameId;

        const playerId = result.value.playerId;
        const publicPayload: PlayerIdPayload = { playerId };

        io.to(room).emit(ServerPublicEvents.PLAYER_CONFIRMED, publicPayload);
      },
    ),
  );

  socket.on(
    ClientEvents.CANCEL_START,
    withErrorHandler(
      cancelStartSchema,
      socket,
      ServerErrorEvents.CANCEL_START_ERROR,
      async (parsed: CancelStartParams) => {
        const userId = socket.data.sub;
        const gameId = parsed.gameId;
        const result = cancelStart(userId, gameId);

        if (!result.ok) {
          socket.emit(ServerErrorEvents.CANCEL_START_ERROR, result.error);
          return;
        }

        const room = parsed.gameId;

        const playerId = result.value.playerId;
        const publicPayload: PlayerIdPayload = { playerId };

        io.to(room).emit(ServerPublicEvents.PLAYER_CANCELED, publicPayload);
      },
    ),
  );
};
