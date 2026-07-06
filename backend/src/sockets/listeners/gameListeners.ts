// Libraries
import { Socket, Server } from "socket.io";
// Project level
import {
  cancelStart,
  confirmStart,
  drawCard,
  playCard,
  joinGame,
  leaveGame,
  reconnectGame,
} from "services";
import { withErrorHandler } from "utils";
import {
  CancelStartParams,
  cancelStartSchema,
  ConfirmStartParams,
  confirmStartSchema,
  DrawCardParams,
  drawCardSchema,
  PLayCardParams,
  playCardSchema,
  JoinGameParams,
  joinGameSchema,
  LeaveGameParams,
  leaveGameSchema,
  ReconnectGameParams,
  reconnectGameSchema,
} from "schemas";
import {
  CardPlayedPayload,
  CardRemovedPayload,
  ClientEvents,
  GameStatePayload,
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
          socket.data.user.id,
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
    ClientEvents.RECONNECT_GAME,
    withErrorHandler(
      reconnectGameSchema,
      socket,
      ServerErrorEvents.RECONNECT_GAME_ERROR,
      async (parsed: ReconnectGameParams) => {
        const gameState = await reconnectGame(parsed, socket.data.user.id);
        const room = parsed.gameId;
        await socket.join(room);
        socketsMap.set(socket.data.user.id, socket);

        const payload: GameStatePayload = gameState;

        socket.emit(ServerPrivateEvents.GAME_STATE, payload);
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
        const { playerId } = await leaveGame(parsed, socket.data.user.id);
        const room = parsed.gameId;
        await socket.leave(room);
        socketsMap.delete(socket.data.user.id);

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
        const { playerId } = await confirmStart(parsed, socket.data.user.id);
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
        const { playerId } = await cancelStart(parsed, socket.data.user.id);
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
        const { playerId, card } = await drawCard(parsed, socket.data.user.id);

        const room = parsed.gameId;

        const privatePayload: CardPayload = { playerId, card };
        const publicPayload: PlayerIdPayload = { playerId };

        socket.emit(ServerPrivateEvents.CARD_RECEIVED, privatePayload);
        io.to(room).emit(ServerPublicEvents.CARD_DRAWN, publicPayload);
      },
    ),
  );

  socket.on(
    ClientEvents.PLAY_CARD,
    withErrorHandler(
      playCardSchema,
      socket,
      ServerErrorEvents.PLAY_CARD_ERROR,
      async (parsed: PLayCardParams) => {
        const { playerId, card } = await playCard(parsed, socket.data.user.id);

        const room = parsed.gameId;
        const cardRemovedPayload: CardRemovedPayload = {
          cardId: card.id,
          reason: "PLAYED",
        };

        const cardPlayedPayload: CardPlayedPayload = {
          playerId,
          cardType: card.type,
          nopeWindowExpiresAt: -1, // TODO: Replace with the real expiration timestamp.
        };

        socket.emit(ServerPrivateEvents.CARD_REMOVED, cardRemovedPayload);
        socket.to(room).emit(ServerPublicEvents.CARD_PLAYED, cardPlayedPayload);
      },
    ),
  );
};
