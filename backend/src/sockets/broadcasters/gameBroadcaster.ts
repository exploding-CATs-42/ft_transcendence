// Project level
import {
  CountdownStartedPayload,
  GameStartedPayload,
  ServerPrivateEvents,
  ServerPublicEvents,
} from "@exploding-cats/contracts";
import { GameOutEvents, TurnChangedPayload } from "@exploding-cats/game-core";
import { Game } from "data/types";
import { io } from "../../app";
import { socketsMap } from "sockets/socketsMap";
import { toGameStartedPayload } from "mappers";

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
