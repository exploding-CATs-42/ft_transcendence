// Project level
import { api } from "../axios";
import type { UserGameHistoryItem } from "components/GameListItem/types";
import type {
  MyProfileUser,
  MyProfileUserWithStats,
  UpdateMeRequestBody,
} from "@exploding-cats/contracts";

const getMe = async (): Promise<MyProfileUserWithStats> => {
  const result = await api.get("/me");
  return result.data.user;
};

const updateMe = async (body: UpdateMeRequestBody): Promise<MyProfileUser> => {
  const result = await api.patch("/me", body);
  return result.data.user;
};

const updateMeAvatar = async (body: FormData): Promise<string> => {
  const result = await api.patch("/me/avatar", body);
  return result.data.avatarUrl;
};

const getMeGames = async (): Promise<UserGameHistoryItem[]> => {
  const result = await api.get(`/me/games`);
  return result.data.games;
};

export default {
  getMe,
  updateMe,
  updateMeAvatar,
  getMeGames,
};
