import type { WaitingPlayerView } from "@exploding-cats/contracts";
import { api } from "../axios";

export type CreateGameReqBody = {
  gameName: string;
  maxPlayers: number;
};

export type GameInfo = {
  id: string;
  name: string;
  maxPlayers: number;
  createdAt: number;
  players: WaitingPlayerView[];
};

const create = async (body: CreateGameReqBody): Promise<GameInfo> => {
  const result = await api.post<GameInfo>("/games", body);
  return result.data;
};

const getCurrent = async (): Promise<GameInfo | null> => {
  const result = await api.get<GameInfo | null>("/games/current");
  return result.data;
};

const getById = async (gameId: string): Promise<GameInfo> => {
  const result = await api.get<GameInfo>(
    `/games/${encodeURIComponent(gameId)}`,
  );
  return result.data;
};

const getAll = async (): Promise<GameInfo[]> => {
  const result = await api.get<GameInfo[]>("/games");
  return result.data;
};

export default {
  create,
  getCurrent,
  getById,
  getAll,
};
