// Project level
import type {
  MyProfileUser,
  ProfileUser,
} from "pages/ProfilePage/types/ProfileUser";
import { api } from "../axios";
import type { UpdateMeRequestBody } from "schemas/me/updateMeSchema";
import type { UserGameHistoryItem } from "components/MatchListItem/types";

const getMe = async (): Promise<MyProfileUser> => {
  const result = await api.get("/me");
  return result.data.user;
};

const updateMe = async (body: UpdateMeRequestBody): Promise<ProfileUser> => {
  const result = await api.patch("/me", body);
  return result.data.user;
};

const updateMeAvatar = async (body: FormData): Promise<MyProfileUser> => {
  const result = await api.patch("/me/avatar", body);
  return result.data.user;
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
