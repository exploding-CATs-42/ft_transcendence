import type {
  LeaderboardEntry,
  ProfileUserWithStats,
  UserId,
} from "@exploding-cats/contracts";
import { api } from "../axios";
import type { UserGameHistoryItem } from "components/GameListItem/types";

const getUserGames = async (userId: UserId): Promise<UserGameHistoryItem[]> => {
  const result = await api.get(`/users/${userId}/games`);
  return result.data.games;
};

const getUserById = async (userId: UserId): Promise<ProfileUserWithStats> => {
  const result = await api.get(`users/${userId}`);
  return result.data.user;
};

const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const result = await api.get("users/leaderboard");
  return result.data.leaderboard;
};

export default {
  getUserGames,
  getUserById,
  getLeaderboard,
};
