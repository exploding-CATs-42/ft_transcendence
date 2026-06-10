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

export type GameState = {
  gameId: string;
  name: string;
  maxPlayers: number;
  players: unknown[];
};

const create = async (body: CreateGameReqBody): Promise<GameInfo> => {
  const result = await api.post<GameInfo>("/games", body);
  return result.data;
};

const getCurrent = async (): Promise<GameInfo | null> => {
  const result = await api.get<GameInfo | null>("/games/current");
  return result.data;
};

export default {
  create,
  getCurrent,
};
