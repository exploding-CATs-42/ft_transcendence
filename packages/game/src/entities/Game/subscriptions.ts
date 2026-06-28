// Libraries
import { AnyActorRef } from "xstate";
// Local level
import { PlayerOutEvents, type PlayerInstance } from "../Player";
import { GameEvents } from "./events";

export const subscribeToPlayerEvents = (
  player: PlayerInstance,
  game: AnyActorRef,
): void => {
  player.on(PlayerOutEvents.READINESS_CONFIRMED, ({ playerId }) => {
    game.send({ type: GameEvents.PLAYER_CONFIRMED_READINESS, playerId });
  });

  // Every future player-emitted event goes here, in one place.
};
