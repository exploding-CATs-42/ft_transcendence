import { z } from "zod";
import { gameId, playerId } from "./ids.schema";

export const leaveGameBodySchema = z.object({
  playerId
});

export const leaveGameParamsSchema = z.object({
  gameId
});

export type LeaveGameRequestParams = z.infer<typeof leaveGameParamsSchema>;
export type LeaveGameRequestBody = z.infer<typeof leaveGameBodySchema>;
