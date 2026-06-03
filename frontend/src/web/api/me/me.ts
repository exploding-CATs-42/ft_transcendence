// Local level
import type { FriendItem, ProfileUser } from "pages/ProfilePage/types";
import { api } from "../axios";

const getMe = async (): Promise<ProfileUser> => {
  const result = await api.get("/me");
  return result.data.user;
};

const getMeFriends = async (): Promise<FriendItem[]> => {
  const result = await api.get("/me/friends");
  return result.data.friends;
};

export default {
  getMe,
  getMeFriends,
};
