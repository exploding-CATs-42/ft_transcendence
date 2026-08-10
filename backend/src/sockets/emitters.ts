// Libraries
import { UserId } from "@exploding-cats/contracts";
// Project level
import { io } from "../app";

// Every window this player has open.
export const emitToPlayer = (
  playerId: UserId,
  event: string,
  ...args: unknown[]
) => {
  io.to(playerId).emit(event, ...args);
};
