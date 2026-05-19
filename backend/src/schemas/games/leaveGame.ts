import { z } from "zod";
import { gameId } from "./ids.schema";

export const leaveGameSchema = z.object({
  gameId
});

export type LeaveGameParams = z.infer<typeof leaveGameSchema>;
