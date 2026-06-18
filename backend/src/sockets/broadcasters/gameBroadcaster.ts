// Project level
import {
  CountdownStartedPayload,
  ServerPrivateEvents,
  ServerPublicEvents,
} from "@exploding-cats/contracts";
import { Game } from "data/types";
import { GameOutEvents } from "game";
import { io } from "../../app";
import { socketsMap } from "sockets/socketsMap";
import { Hand } from "game/eventPayloads";

export function attachGameBroadcaster(game: Game) {
  const { instance: broadcaster, id: gameId } = game;

  broadcaster.on(GameOutEvents.GAME_STARTED, () => {
    io.to(gameId).emit(ServerPublicEvents.GAME_STARTED);
  });

  broadcaster.on(GameOutEvents.COUNTDOWN_STARTED, (event) => {
    const payload: CountdownStartedPayload = { endsAt: event.endsAt };

    io.to(gameId).emit(ServerPublicEvents.COUNTDOWN_STARTED, payload);
  });

  broadcaster.on(GameOutEvents.COUNTDOWN_CANCELED, () => {
    io.to(gameId).emit(ServerPublicEvents.COUNTDOWN_CANCELED);
  });

  broadcaster.on(GameOutEvents.CARDS_DEALT, (event) => {
    const hands: Hand[] = event.payload;
    hands.forEach((hand) => {
      const socket = socketsMap.get(hand.playerId)!;
      socket.emit(ServerPrivateEvents.YOUR_HAND, hand);
    });
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
