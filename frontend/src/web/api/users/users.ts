import { api } from "../axios";
import type { UserGameHistoryItem } from "components/GameListItem/types";
import type {
  ProfileUserWithStats,
  UserId,
} from "pages/ProfilePage/types/ProfileUser";

const getUserGames = async (userId: UserId): Promise<UserGameHistoryItem[]> => {
  const result = await api.get(`/users/${userId}/games`);
  return result.data.games;
};

const getUserById = async (userId: UserId): Promise<ProfileUserWithStats> => {
  const result = await api.get(`users/${userId}`);
  return result.data.user;
};

export default {
  getUserGames,
  getUserById,
};
