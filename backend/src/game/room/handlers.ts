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

export const drawCard = ({ actor, emitters }: RoomOps, playerId: string) => {
  const before = actor.getSnapshot().context;
  const currentId = before.players[before.currentPlayerIndex]?.playerId;
  if (currentId !== playerId) return;

  actor.send({ type: "DRAW_CARD", playerId });

  const after = actor.getSnapshot().context;
  const drawer = after.players.find((p) => p.playerId === playerId);

  if (drawer) {
    emitters.emitToPlayer(playerId, PrivateEventType.YOUR_HAND, {
      hand: drawer.hand
    });
  }
  emitters.emitToRoom(ServerEventType.CARD_DRAWN, { playerId });
  emitters.emitToRoom(ServerEventType.TURN_CHANGED, {
    currentPlayerId: after.players[after.currentPlayerIndex]?.playerId,
    turnNumber: after.turnNumber
  });
};
