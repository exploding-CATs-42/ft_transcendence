import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "api";
import { getErrorMessage } from "utils";
import type { UserGameHistoryItem } from "components/GameListItem/types";

interface Props {
  userId: string | undefined;
  isMyProfile: boolean;
}

export const useGames = ({ userId, isMyProfile }: Props) => {
  const [games, setGames] = useState<UserGameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        let data: UserGameHistoryItem[] = [];

        if (isMyProfile) {
          data = await api.me.getMeGames();
        } else if (userId) {
          data = await api.users.getUserGames(userId);
        }

        setGames(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setGames([]);
        toast(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [isMyProfile, userId]);

  return {
    games,
    gamesLoading: loading,
  };
};
