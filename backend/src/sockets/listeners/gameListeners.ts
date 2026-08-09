// Libraries
import { Socket, Server } from "socket.io";
// Project level
import {
  cancelStart,
  confirmStart,
  drawCard,
  playCard,
  playCombo,
  playDefuse,
  insertKitten,
  joinGame,
  leaveGame,
  reconnectGame,
  playNope,
  selectPlayer,
  chooseCardId,
  confirmPlayerSeenTheCards,
  chooseCardType,
  chooseCardIndex,
} from "services";
import { withErrorHandler } from "utils";
import {
  CancelStartParams,
  cancelStartSchema,
  ConfirmStartParams,
  confirmStartSchema,
  DrawCardParams,
  drawCardSchema,
  PlayCardParams,
  playCardSchema,
  PlayComboParams,
  playComboSchema,
  PlayDefuseParams,
  playDefuseSchema,
  InsertKittenParams,
  insertKittenSchema,
  JoinGameParams,
  joinGameSchema,
  LeaveGameParams,
  leaveGameSchema,
  ReconnectGameParams,
  reconnectGameSchema,
  playNopeSchema,
  PlayNopeParams,
  SelectPlayerPayload,
  selectPlayerSchema,
  chooseCardIdSchema,
  ChooseCardIdPayload,
  SeenTheFuturePayload,
  seenTheFutureSchema,
  chooseCardIndexSchema,
  ChooseCardIndexPayload,
  chooseCardTypeSchema,
  ChooseCardTypePayload,
} from "schemas";
import {
  CardPlayedPayload,
  CardRemovedPayload,
  ComboPlayedPayload,
  ClientEvents,
  GameStatePayload,
  PlayerIdPayload,
  PlayerJoinedPayload,
  ServerErrorEvents,
  ServerPrivateEvents,
  ServerPublicEvents,
  WaitingStatePayload,
  NopePlayedPayload,
  CardReceivedPayload,
} from "@exploding-cats/contracts";
// Local level
import { broadcastLobbyGameChanged } from "../broadcasters";
import { socketsMap } from "../socketsMap";
import { CardReceivalReason } from "@exploding-cats/game-core";

export const registerGameEventHandlers = (io: Server, socket: Socket) => {
  socket.on(
    ClientEvents.JOIN_GAME,
    withErrorHandler(
      joinGameSchema,
      socket,
      ServerErrorEvents.JOIN_GAME_ERROR,
      async (parsed: JoinGameParams) => {
        const room = parsed.gameId;
        await socket.join(room);

        try {
          const { players, player, countdownEndsAt, isNewPlayer } =
            await joinGame(parsed, socket.data.user.id);
          socketsMap.set(player.id, socket);

          const privatePayload: WaitingStatePayload = {
            players,
            meId: player.id,
            countdownEndsAt,
          };
          const publicPayload: PlayerJoinedPayload = { player };

          socket.emit(ServerPrivateEvents.WAITING_STATE, privatePayload);

          if (isNewPlayer) {
            socket
              .to(room)
              .emit(ServerPublicEvents.PLAYER_JOINED, publicPayload);
          }

          broadcastLobbyGameChanged(parsed.gameId);
        } catch (error) {
          await socket.leave(room);
          throw error;
        }
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
        broadcastLobbyGameChanged(parsed.gameId);
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

        const privatePayload: CardReceivedPayload = {
          card,
          reason: CardReceivalReason.DRAW,
        };
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
      async (parsed: PlayCardParams) => {
        const { playerId, card, nopeWindowExpiresAt } = await playCard(
          parsed,
          socket.data.user.id,
        );

        const room = parsed.gameId;
        const cardRemovedPayload: CardRemovedPayload = {
          cardId: card.id,
          reason: "PLAYED",
        };

        const cardPlayedPayload: CardPlayedPayload = {
          playerId,
          cardType: card.type,
          nopeWindowExpiresAt,
        };

        socket.emit(ServerPrivateEvents.CARD_REMOVED, cardRemovedPayload);
        socket.to(room).emit(ServerPublicEvents.CARD_PLAYED, cardPlayedPayload);
      },
    ),
  );

  socket.on(
    ClientEvents.PLAY_NOPE,
    withErrorHandler(
      playNopeSchema,
      socket,
      ServerErrorEvents.PLAY_NOPE_ERROR,
      async (parsed: PlayNopeParams) => {
        const { playerId, card, nopeWindowExpiresAt } = await playNope(
          parsed,
          socket.data.user.id,
        );

        const room = parsed.gameId;

        const cardRemovedPayload: CardRemovedPayload = {
          cardId: card.id,
          reason: "PLAYED",
        };

        const nopePlayedPayload: NopePlayedPayload = {
          playerId,
          nopeWindowExpiresAt,
        };

        socket.emit(ServerPrivateEvents.CARD_REMOVED, cardRemovedPayload);
        socket.to(room).emit(ServerPublicEvents.NOPE_PLAYED, nopePlayedPayload);
      },
    ),
  );

  socket.on(
    ClientEvents.PLAY_COMBO,
    withErrorHandler(
      playComboSchema,
      socket,
      ServerErrorEvents.PLAY_COMBO_ERROR,
      async (parsed: PlayComboParams) => {
        const { playerId, cards, nopeWindowExpiresAt } = await playCombo(
          parsed,
          socket.data.user.id,
        );

        cards.forEach((card) => {
          const cardRemovedPayload: CardRemovedPayload = {
            cardId: card.id,
            reason: "PLAYED",
          };

          socket.emit(ServerPrivateEvents.CARD_REMOVED, cardRemovedPayload);
        });

        const comboPlayedPayload: ComboPlayedPayload = {
          playerId,
          cardTypes: cards.map((card) => card.type),
          nopeWindowExpiresAt: nopeWindowExpiresAt,
        };
        socket
          .to(parsed.gameId)
          .emit(ServerPublicEvents.COMBO_PLAYED, comboPlayedPayload);
      },
    ),
  );

  socket.on(
    ClientEvents.PLAY_DEFUSE,
    withErrorHandler(
      playDefuseSchema,
      socket,
      ServerErrorEvents.PLAY_DEFUSE_ERROR,
      async (parsed: PlayDefuseParams) => {
        // The machine broadcasts PLAYER_DEFUSED via the game broadcaster in
        // response to the PLAY_DEFUSE event; here we only need to privately
        // remove the consumed Defuse card from the drawing player's hand.
        const { playerId, card } = await playDefuse(
          parsed,
          socket.data.user.id,
        );

        const cardRemovedPayload: CardRemovedPayload = {
          cardId: card.id,
          reason: "PLAYED",
        };

        const room = parsed.gameId;
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

  socket.on(
    ClientEvents.INSERT_KITTEN,
    withErrorHandler(
      insertKittenSchema,
      socket,
      ServerErrorEvents.INSERT_KITTEN_ERROR,
      async (parsed: InsertKittenParams) => {
        // The machine broadcasts KITTEN_INSERTED (and the subsequent
        // TURN_CHANGED) via the game broadcaster in response to INSERT_KITTEN;
        // here we only forward the chosen position into the machine and remove.
        const { card } = await insertKitten(parsed, socket.data.user.id);

        const cardRemovedPayload: CardRemovedPayload = {
          cardId: card.id,
          reason: "INSERTED_INTO_DECK",
        };
        socket.emit(ServerPrivateEvents.CARD_REMOVED, cardRemovedPayload);
      },
    ),
  );

  socket.on(
    ClientEvents.SELECT_PLAYER,
    withErrorHandler(
      selectPlayerSchema,
      socket,
      ServerErrorEvents.SELECT_PLAYER_ERROR,
      async (parsed: SelectPlayerPayload) => {
        await selectPlayer(parsed, socket.data.user.id);
      },
    ),
  );

  socket.on(
    ClientEvents.CHOOSE_CARD_ID,
    withErrorHandler(
      chooseCardIdSchema,
      socket,
      ServerErrorEvents.CHOOSE_CARD_ID_ERROR,
      async (parsed: ChooseCardIdPayload) => {
        await chooseCardId(parsed, socket.data.user.id);
      },
    ),
  );

  socket.on(
    ClientEvents.CHOOSE_CARD_INDEX,
    withErrorHandler(
      chooseCardIndexSchema,
      socket,
      ServerErrorEvents.CHOOSE_CARD_INDEX_ERROR,
      async (parsed: ChooseCardIndexPayload) => {
        await chooseCardIndex(parsed, socket.data.user.id);
      },
    ),
  );

  socket.on(
    ClientEvents.CHOOSE_CARD_TYPE,
    withErrorHandler(
      chooseCardTypeSchema,
      socket,
      ServerErrorEvents.CHOOSE_CARD_TYPE_ERROR,
      async (parsed: ChooseCardTypePayload) => {
        await chooseCardType(parsed, socket.data.user.id);
      },
    ),
  );

  socket.on(
    ClientEvents.SEEN_THE_FUTURE,
    withErrorHandler(
      seenTheFutureSchema,
      socket,
      ServerErrorEvents.SEEN_THE_FUTURE_ERROR,
      async (parsed: SeenTheFuturePayload) => {
        await confirmPlayerSeenTheCards(parsed, socket.data.user.id);
      },
    ),
  );
};
