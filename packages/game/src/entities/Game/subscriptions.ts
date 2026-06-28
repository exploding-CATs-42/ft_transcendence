// subscriptions.ts
import type { GameInstance } from "./types";
import { PlayerOutEvents, type PlayerInstance } from "../Player";
import { GameEvents } from "./events";

export const subscribeToPlayerEvents = (
  player: PlayerInstance,
  game: GameInstance,
) => {
  player.on(PlayerOutEvents.READINESS_CONFIRMED, ({ playerId }) => {
    game.send({ type: GameEvents.PLAYER_CONFIRMED_READINESS, playerId });
  });

  // every future player out-event goes here, in one place
};
