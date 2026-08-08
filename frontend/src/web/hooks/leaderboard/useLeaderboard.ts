import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "api";
import { getErrorMessage } from "utils";
import type { LeaderboardEntry } from "@exploding-cats/contracts";

export const useLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const fetchLeaderboard = async () => {
      try {
        const data = await api.users.getLeaderboard();

        if (!isActive) return;

        setEntries(data);
      } catch (error) {
        if (!isActive) return;

        const errorMessage = getErrorMessage(error);
        setEntries([]);
        toast(errorMessage);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void fetchLeaderboard();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    entries,
    leaderboardLoading: loading,
  };
};
