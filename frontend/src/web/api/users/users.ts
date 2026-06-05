import { api } from "../axios";
import type { UserGameHistoryItem } from "components/MatchListItem/types";
import type { UserId } from "pages/ProfilePage/types/ProfileUser";

const getUserGames = async (userId: UserId): Promise<UserGameHistoryItem[]> => {
  const result = await api.get(`users/${userId}/games`);
  return result.data.games;
};

export default {
  getUserGames,
};
