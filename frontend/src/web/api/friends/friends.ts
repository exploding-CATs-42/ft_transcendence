import type {
  ListFriendsQuery,
  UpdateFriendshipBody,
  UpdateFriendshipParams,
  UserIdBody,
  UserIdParams,
} from "@exploding-cats/shared-schemas";
import { api } from "../axios";
import type { FriendItem } from "pages/ProfilePage/types";

const getMeFriends = async (
  query?: ListFriendsQuery,
): Promise<FriendItem[]> => {
  const result = await api.get("/me/friends", {
    params: query,
  });
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

const deleteFriendship = async (body: UserIdBody) => {
  await api.delete(`/me/friends`, {
    data: body,
  });
};

const createFriendRequest = async (body: UserIdBody) => {
  await api.post(`/me/friends`, body);
};

const updateFriendship = async (
  body: UpdateFriendshipBody,
  params: UpdateFriendshipParams,
) => {
  await api.patch(`/me/friends/${params.userId}`, body);
};

export default {
  getMeFriends,
  getUserFriends,
  deleteFriendship,
  createFriendRequest,
  updateFriendship,
};
