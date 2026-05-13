import { Actor } from "xstate";
import { PrivateEventType, ServerEventType } from "../../types/events";
import { gameMachine } from "../gameMachine";
import { Emitters } from "./emitters";

type GameActor = Actor<typeof gameMachine>;

export interface RoomOps {
  actor: GameActor;
  emitters: Emitters;
}

export const sendInitialState = ({ actor, emitters }: RoomOps) => {
  const { players, cardsPerPlayer, turnNumber, currentPlayerIndex } =
    actor.getSnapshot().context;

  emitters.emitToRoom(ServerEventType.GAME_STARTING, {
    players: players.map((p) => ({
      playerId: p.playerId,
      displayName: p.displayName
    }))
  });

  emitters.emitToRoom(ServerEventType.DEALING_CARDS, {
    cardsPerPlayer: cardsPerPlayer
  });

  for (const player of players) {
    emitters.emitToPlayer(player.playerId, PrivateEventType.YOUR_HAND, {
      hand: player.hand
    });
  }

  emitters.emitToRoom(ServerEventType.GAME_STARTED, {});

  emitters.emitToRoom(ServerEventType.TURN_CHANGED, {
    currentPlayerId: players[currentPlayerIndex]?.playerId,
    turnNumber: turnNumber
  });
};
