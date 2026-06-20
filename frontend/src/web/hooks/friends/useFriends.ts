import { useEffect, useState } from "react";

import type { FriendItem } from "pages/ProfilePage/types";
import api from "api";
import { getErrorMessage } from "utils";
import { toast } from "react-toastify";

interface Props {
  userId: string | undefined;
  isMyProfile: boolean;
}

export const useFriends = ({ userId, isMyProfile }: Props) => {
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        let data: FriendItem[] = [];

        if (isMyProfile) {
          data = await api.friends.getMeFriends({
            view: "friends_and_requests",
          });
        } else if (userId) {
          data = await api.friends.getUserFriends(
            { userId },
            { view: "accepted" },
          );
        }

        setFriends(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setFriends([]);
        toast(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [isMyProfile, userId]);

  return {
    friends,
    friendsLoading: loading,
    setFriends,
  };
};
