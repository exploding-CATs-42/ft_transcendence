// Libraries
import { Socket, Server } from "socket.io";
// Project level
import {
  cancelStart,
  confirmStart,
  drawCard,
  dropCard,
  joinGame,
  leaveGame,
} from "services";
import { withErrorHandler } from "utils";
import {
  CancelStartParams,
  cancelStartSchema,
  ConfirmStartParams,
  confirmStartSchema,
  DrawCardParams,
  drawCardSchema,
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
} from "@exploding-cats/contracts";
import { CardPayload } from "@exploding-cats/game-core";
// Local level
import { socketsMap } from "../socketsMap";
import { DropCardParams, dropCardSchema } from "schemas/games/dropCardSchema";
import { serve } from "swagger-ui-express";

export const registerGameEventHandlers = (io: Server, socket: Socket) => {
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
        socketsMap.set(player.id, socket);

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

  socket.on(
    ClientEvents.DRAW_CARD,
    withErrorHandler(
      drawCardSchema,
      socket,
      ServerErrorEvents.DRAW_CARD_ERROR,
      async (parsed: DrawCardParams) => {
        const { playerId, card } = await drawCard(parsed, socket.data.sub);

        const room = parsed.gameId;

        const payload: CardPayload = { playerId, card };

        socket.emit(ServerPrivateEvents.CARD_RECEIVED, payload);
        io.to(room).emit(ServerPublicEvents.CARD_DRAWN);
      },
    ),
  );

  socket.on(
    ClientEvents.DROP_CARD,
    withErrorHandler(
      dropCardSchema,
      socket,
      ServerErrorEvents.DROP_CARD_ERROR,
      async (parsed: DropCardParams) => {
        await dropCard(parsed, socket.data.sub);

        const room = parsed.gameId;

        socket.emit(ServerPrivateEvents.CARD_REMOVED);
        io.to(room).emit(ServerPublicEvents.CARD_PLAYED);
      },
    ),
  );
};
