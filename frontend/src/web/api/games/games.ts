import type { GameRecord } from "@exploding-cats/contracts";
import { api } from "../axios";

export type CreateGameReqBody = {
  gameName: string;
  maxPlayers: number;
};

const create = async (body: CreateGameReqBody): Promise<GameRecord> => {
  const result = await api.post<GameRecord>("/games", body);
  return result.data;
};

const getCurrent = async (): Promise<GameRecord | null> => {
  const result = await api.get<GameRecord | null>("/games/current");
  return result.data;
};

const getById = async (gameId: string): Promise<GameRecord> => {
  const result = await api.get<GameRecord>(
    `/games/${encodeURIComponent(gameId)}`,
  );
  return result.data;
};

const getAll = async (): Promise<GameRecord[]> => {
  const result = await api.get<GameRecord[]>("/games");
  return result.data;
};

export default {
  create,
  getCurrent,
  getById,
  getAll,
};
