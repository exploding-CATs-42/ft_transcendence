import { api } from "../axios";
import type { FriendItem, UserId } from "pages/ProfilePage/types";

const getMeFriends = async (): Promise<FriendItem[]> => {
  const result = await api.get("/me/friends");
  return result.data.friends;
};

const getUserFriends = async (userId: UserId): Promise<FriendItem[]> => {
  const result = await api.get(`/users/${userId}/friends`);
  return result.data.friends;
};

export default {
  getMeFriends,
  getUserFriends,
};
