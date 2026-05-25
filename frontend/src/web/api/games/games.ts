import { api } from "../axios";

export type CreateGameReqBody = {
  gameName: string;
  maxPlayers: number;
};

export type GameState = {
  gameId: string;
  name: string;
  maxPlayers: number;
  players: unknown[];
};

const create = async (body: CreateGameReqBody): Promise<GameState> => {
  const result = await api.post<GameState>("/games", body);
  return result.data;
};

export default {
  create,
};
