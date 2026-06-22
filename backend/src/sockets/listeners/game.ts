// Libraries
import { Socket, Server } from "socket.io";
// Project level
import {
  cancelStart,
  confirmStart,
  getGameById,
  joinGame,
  leaveGame,
} from "services";
import { GameStates } from "game";
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

export const lobbyGameHandlers = (io: Server, socket: Socket) => {
  socket.on(
    ClientEvents.JOIN_GAME,
    withErrorHandler(
      joinGameSchema,
      socket,
      ServerErrorEvents.JOIN_GAME_ERROR,
      async (parsed: JoinGameParams) => {
        const { waitingState, player } = await joinGame(
          parsed,
          socket.data.sub,
        );

        const room = parsed.gameId;
        await socket.join(room);

        const privatePayload: WaitingStatePayload = { waitingState };
        const publicPayload: PlayerJoinedPayload = { player };

        socket.emit(ServerPrivateEvents.WAITING_STATE, privatePayload);
        socket.to(room).emit(ServerPublicEvents.PLAYER_JOINED, publicPayload);

        const game = await getGameById(socket.data.sub, parsed);
        const isPlaying = game.instance
          .getSnapshot()
          .matches(GameStates.PLAYING);

        if (isPlaying) {
          socket.emit(ServerPublicEvents.GAME_STARTED);
        }
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
        const { playerId } = await leaveGame(parsed, socket.data.sub);
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
        const { playerId } = await confirmStart(parsed, socket.data.sub);
        const room = parsed.gameId;

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
        const { playerId } = await cancelStart(parsed, socket.data.sub);
        const room = parsed.gameId;

        const publicPayload: PlayerIdPayload = { playerId };

        io.to(room).emit(ServerPublicEvents.PLAYER_CANCELED, publicPayload);
      },
    ),
  );
};
