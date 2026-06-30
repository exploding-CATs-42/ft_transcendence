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
};

const create = async (body: CreateGameReqBody): Promise<GameInfo> => {
  const result = await api.post<GameInfo>("/games", body);
  return result.data;
};

const getCurrent = async (): Promise<GameInfo | null> => {
  const result = await api.get<GameInfo | null>("/games/current");
  return result.data;
};

const getAll = async (): Promise<GameInfo[]> => {
  const result = await api.get<GameInfo[]>("/games");
  return result.data;
};

const joinById = async (gameId: string): Promise<void> => {
  await api.post(`/games/${gameId}/join`);
};

const leaveById = async (gameId: string): Promise<void> => {
  await api.post(`/games/${gameId}/leave`);
};

export default {
  create,
  getCurrent,
  getAll,
  joinById,
  leaveById,
};
