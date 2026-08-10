// Project level
import {
  CardGivenPayload,
  CardReceivedPayload,
  CardRemovalReason,
  CardRemovedPayload,
  CardStolenPayload,
  CountdownStartedPayload,
  DefusePromptPayload,
  GameStartedPayload,
  ServerPrivateEvents,
  ServerPublicEvents,
} from "@exploding-cats/contracts";
import {
  GameOutEvents,
  TurnChangedPayload,
  TurnSkippedPayload,
  PlayerDefusedPayload,
  KittenInsertedPayload,
  PlayerEliminatedPayload,
  GameOverPayload,
  ExplodingKittenDrawnPayload,
  CardReceivalReason,
} from "@exploding-cats/game-core";
import { Game } from "data/types";
import { io } from "../../app";
import { emitToGameExceptPlayer, emitToPlayer } from "sockets/emitters";
import { toGameStartedPayload } from "mappers";
// Local level
import { broadcastLobbyGameRemoved } from "./lobbyBroadcaster";

export function attachGameBroadcaster(game: Game) {
  const { instance: broadcaster, id: gameId } = game;

  broadcaster.on(GameOutEvents.GAME_STARTED, (event) => {
    const players = event.players;

    players.forEach((player) => {
      const payload: GameStartedPayload = toGameStartedPayload(
        players,
        player.id,
        event.deckSize,
        event.kittensInDeck,
      );

      emitToPlayer(player.id, ServerPrivateEvents.GAME_STARTED, payload);
    });

    // The countdown starts the game on its own, so this is the only chance to
    // drop it from the lobby lists of everyone who is not playing it.
    broadcastLobbyGameRemoved(gameId);
  });

  broadcaster.on(GameOutEvents.COUNTDOWN_STARTED, (event) => {
    const payload: CountdownStartedPayload = { endsAt: event.endsAt };

    io.to(gameId).emit(ServerPublicEvents.COUNTDOWN_STARTED, payload);
  });

  broadcaster.on(GameOutEvents.COUNTDOWN_CANCELED, () => {
    io.to(gameId).emit(ServerPublicEvents.COUNTDOWN_CANCELED);
  });

  broadcaster.on(GameOutEvents.TURN_CHANGED, (event) => {
    const payload: TurnChangedPayload = event.payload;

    io.to(gameId).emit(ServerPublicEvents.TURN_CHANGED, payload);
  });

  broadcaster.on(GameOutEvents.DECK_SHUFFLED, () => {
    io.to(gameId).emit(ServerPublicEvents.DECK_SHUFFLED);
  });

  broadcaster.on(GameOutEvents.TURN_SKIPPED, (event) => {
    const payload: TurnSkippedPayload = event.payload;

    io.to(gameId).emit(ServerPublicEvents.TURN_SKIPPED, payload);
  });

  broadcaster.on(GameOutEvents.SHOWED_TOP_CARDS, (event) => {
    const { playerId } = event.payload;

    emitToPlayer(
      playerId,
      ServerPrivateEvents.SEE_THE_FUTURE_PEEK,
      event.payload,
    );

    emitToGameExceptPlayer(
      gameId,
      playerId,
      ServerPublicEvents.PLAYER_LOOKS_AT_THE_FUTURE,
    );
  });

  broadcaster.on(GameOutEvents.EXPLODING_KITTEN_DRAWN, (event) => {
    const payload: ExplodingKittenDrawnPayload = event.payload;

    io.to(gameId).emit(ServerPublicEvents.EXPLODING_KITTEN_DRAWN, payload);
  });

  broadcaster.on(GameOutEvents.DEFUSE_PROMPT, (event) => {
    const { playerId } = event.payload;
    const payload: DefusePromptPayload = event.payload;

    emitToPlayer(playerId, ServerPrivateEvents.DEFUSE_PROMPT, payload);
  });

  broadcaster.on(GameOutEvents.PLAYER_DEFUSED, (event) => {
    const payload: PlayerDefusedPayload = event.payload;

    io.to(gameId).emit(ServerPublicEvents.PLAYER_DEFUSED, payload);
  });

  broadcaster.on(GameOutEvents.KITTEN_INSERTED, (event) => {
    const payload: KittenInsertedPayload = event.payload;

    io.to(gameId).emit(ServerPublicEvents.KITTEN_INSERTED, payload);
  });

  broadcaster.on(GameOutEvents.PLAYER_ELIMINATED, (event) => {
    const payload: PlayerEliminatedPayload = event.payload;

    io.to(gameId).emit(ServerPublicEvents.PLAYER_ELIMINATED, payload);
  });

  broadcaster.on(GameOutEvents.GAME_OVER, (event) => {
    const payload: GameOverPayload = event.payload;

    io.to(gameId).emit(ServerPublicEvents.GAME_OVER, payload);
  });

  broadcaster.on(GameOutEvents.NOPE_WINDOW_RESOLVED, () => {
    io.to(gameId).emit(ServerPublicEvents.NOPE_WINDOW_RESOLVED);
  });

  broadcaster.on(GameOutEvents.PLAYER_SELECTED, (event) => {
    io.to(gameId).emit(ServerPublicEvents.PLAYER_SELECTED, event.payload);
  });

  broadcaster.on(GameOutEvents.WAITING_FOR_PLAYER_SELECTION, () => {
    io.to(gameId).emit(ServerPublicEvents.WAITING_FOR_PLAYER_SELECTION);
  });

  broadcaster.on(GameOutEvents.WAITING_FOR_CARD_ID_SELECTION, (event) => {
    io.to(gameId).emit(
      ServerPublicEvents.WAITING_FOR_CARD_ID_SELECTION,
      event.payload,
    );
  });

  broadcaster.on(GameOutEvents.PLAYER_SAW_THE_FUTURE, (event) => {
    emitToGameExceptPlayer(
      gameId,
      event.payload.playerId,
      ServerPublicEvents.PLAYER_SAW_THE_FUTURE,
    );
  });

  broadcaster.on(GameOutEvents.WAITING_FOR_CARD_INDEX_SELECTION, (event) => {
    io.to(gameId).emit(
      ServerPublicEvents.WAITING_FOR_CARD_INDEX_SELECTION,
      event.payload,
    );
  });

  broadcaster.on(GameOutEvents.WAITING_FOR_CARD_TYPE_SELECTION, (event) => {
    io.to(gameId).emit(
      ServerPublicEvents.WAITING_FOR_CARD_TYPE_SELECTION,
      event.payload,
    );
  });

  broadcaster.on(GameOutEvents.CARD_GIVEN, (event) => {
    const {
      playerIdFrom,
      playerIdTo,
      card,
      reason: receivalReason,
    } = event.payload;

    const cardRemovedPayload: CardRemovedPayload = {
      cardId: card.id,
      reason:
        receivalReason === CardReceivalReason.FAVOR
          ? CardRemovalReason.GIVEN_AWAY
          : CardRemovalReason.STOLEN,
    };
    emitToPlayer(
      playerIdFrom,
      ServerPrivateEvents.CARD_REMOVED,
      cardRemovedPayload,
    );

    const cardReceivedPayload: CardReceivedPayload = {
      card,
      reason: receivalReason,
      playerIdFrom,
    };
    emitToPlayer(
      playerIdTo,
      ServerPrivateEvents.CARD_RECEIVED,
      cardReceivedPayload,
    );

    if (receivalReason === CardReceivalReason.FAVOR) {
      const cardGivenPayload: CardGivenPayload = {
        playerIdFrom,
        playerIdTo,
      };
      io.to(gameId).emit(ServerPublicEvents.CARD_GIVEN, cardGivenPayload);
    } else if (receivalReason === CardReceivalReason.CAT_PAIR) {
      const cardStolenPayload: CardStolenPayload = {
        playerIdFrom,
        playerIdTo,
      };
      io.to(gameId).emit(ServerPublicEvents.CARD_STOLEN, cardStolenPayload);
    } else if (receivalReason === CardReceivalReason.CAT_TRIPLE) {
      const cardStolenPayload: CardStolenPayload = {
        playerIdFrom,
        playerIdTo,
        cardType: card.type,
      };
      io.to(gameId).emit(ServerPublicEvents.CARD_STOLEN, cardStolenPayload);
    }
  });

  broadcaster.on(GameOutEvents.NO_CARD_OF_REQUESTED_TYPE, (event) => {
    io.to(gameId).emit(
      ServerPublicEvents.NO_CARD_OF_REQUESTED_TYPE,
      event.payload,
    );
  });
}

/* broadcaster - is a function that broadcasts events
 * emitted by the machine to the outside world.
 */

// broadcaster example
/*
   broadcaster.on(GameOutEvents.PLAYER_ADDED, (event: GameOutEvent) => {
       io.to(gameId).emit(ServerPublicEvents.PLAYER_ADDED, {playerId: event.playerId});
   });
*/
