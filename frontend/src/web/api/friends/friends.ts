import type { ListFriendsQuery, UserIdParams } from "@exploding-cats/contracts";
import { api } from "../axios";
import type { FriendItem } from "pages/ProfilePage/types";

const getMeFriends = async (): Promise<FriendItem[]> => {
  const result = await api.get("/me/friends");
  return result.data.friends;
};

const getUserFriends = async (
  params: UserIdParams,
  query?: ListFriendsQuery,
): Promise<FriendItem[]> => {
  const result = await api.get(`/users/${params.userId}/friends`, {
    params: query,
  });

  return result.data.friends;
};

export default {
  getMeFriends,
  getUserFriends,
};
