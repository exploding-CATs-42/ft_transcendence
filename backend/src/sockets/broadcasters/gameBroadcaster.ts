// Project level
import {
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
} from "@exploding-cats/game-core";
import { Game } from "data/types";
import { io } from "../../app";
import { socketsMap } from "sockets/socketsMap";
import { toGameStartedPayload } from "mappers";
// Local level
import { broadcastLobbyGameRemoved } from "./lobbyBroadcaster";

export function attachGameBroadcaster(game: Game) {
  const { instance: broadcaster, id: gameId } = game;

  broadcaster.on(GameOutEvents.GAME_STARTED, (event) => {
    const players = event.players;

    players.forEach((player) => {
      const socket = socketsMap.get(player.id);
      const payload: GameStartedPayload = toGameStartedPayload(
        players,
        player.id,
        event.deckSize,
      );

      socket?.emit(ServerPrivateEvents.GAME_STARTED, payload);
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
    const socket = socketsMap.get(event.payload.playerId)!;
    socket.emit(ServerPrivateEvents.SEE_THE_FUTURE_PEEK, event.payload);
  });

  broadcaster.on(GameOutEvents.EXPLODING_KITTEN_DRAWN, () => {
    io.to(gameId).emit(ServerPublicEvents.EXPLODING_KITTEN_DRAWN);
  });

  broadcaster.on(GameOutEvents.DEFUSE_PROMPT, (event) => {
    const { playerId } = event.payload;
    const payload: DefusePromptPayload = event.payload;

    const socket = socketsMap.get(playerId);
    socket?.emit(ServerPrivateEvents.DEFUSE_PROMPT, payload);
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

  broadcaster.on(GameOutEvents.WAITING_FOR_FAVOR_CARD_SELECTION, (event) => {
    io.to(gameId).emit(
      ServerPublicEvents.WAITING_FOR_FAVOR_CARD_SELECTION,
      event.payload,
    );
  });

  broadcaster.on(GameOutEvents.PLAYER_SAW_THE_FUTURE, (event) => {
    const socket = socketsMap.get(event.payload.playerId);
    socket?.to(gameId).emit(ServerPublicEvents.PLAYER_SAW_THE_FUTURE);
  });

  broadcaster.on(GameOutEvents.COMBO_SELECTION_REQUESTED, (event) => {
    socketsMap.get(event.payload.playerId)?.emit(
      ServerPublicEvents.COMBO_SELECTION_REQUESTED,
      event.payload,
    );
  });
}

/* broadcaster - is a function that just repeats/broadcasts events
 * emitted by the machine to the outside world. it's as simple/stupid as a parrot
 * it hears something - it repeats/broadcasts it
 */

// broadcaster example
/*
   broadcaster.on(GameOutEvents.PLAYER_ADDED, (event: GameOutEvent) => {
       io.to(gameId).emit(ServerPublicEvents.PLAYER_ADDED, {playerId: event.playerId});
   });
*/
