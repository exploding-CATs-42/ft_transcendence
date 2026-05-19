import { z } from "zod";

export const uuid = z.uuid();
export const playerName = z.string().trim().min(3).max(30);
export const playerId = uuid;
export const gameId = uuid;
