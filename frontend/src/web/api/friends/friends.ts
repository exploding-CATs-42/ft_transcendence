import { api } from "../axios";
import type { FriendItem } from "pages/ProfilePage/types";

const getMeFriends = async (): Promise<FriendItem[]> => {
  const result = await api.get("/me/friends");
  return result.data.friends;
};

export default {
  getMeFriends,
};
