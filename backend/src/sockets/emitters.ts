// Libraries
import { UserId } from "@exploding-cats/contracts";
// Project level
import { GameId } from "data/types";
import { io } from "../app";

// Every window this player has open.
export const emitToPlayer = (
  playerId: UserId,
  event: string,
  ...args: unknown[]
) => {
  io.to(playerId).emit(event, ...args);
};

// Everyone in the game except every window of the given player(s).
export const emitToGameExceptPlayer = (
  gameId: GameId,
  playerId: UserId | UserId[],
  event: string,
  ...args: unknown[]
) => {
  io.to(gameId)
    .except(playerId)
    .emit(event, ...args);
};
