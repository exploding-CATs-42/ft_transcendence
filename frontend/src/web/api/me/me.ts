// Project level
import type { MyProfileUser } from "pages/ProfilePage/types/ProfileUser";
import { api } from "../axios";
import type { UserGameHistoryItem } from "components/GameListItem/types";
import type { UpdateMeRequestBody } from "schemas/me/updateMeSchema";

const getMe = async (): Promise<MyProfileUser> => {
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
