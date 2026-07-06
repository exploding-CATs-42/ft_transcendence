import { useEffect, useState } from "react";

import api from "api";
import { getErrorMessage } from "utils";
import { toast } from "react-toastify";
import {
  ServerPrivateEvents,
  type FriendItem,
  type FriendOnlineStatusChangedPayload,
} from "@exploding-cats/contracts";
import { useSocket } from "hooks/sockets/useSocket";

interface Props {
  userId: string | undefined;
  isMyProfile: boolean;
}

export const useFriends = ({ userId, isMyProfile }: Props) => {
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const updateFriendsOnlineStatus = (
    friends: FriendItem[],
    payload: FriendOnlineStatusChangedPayload,
  ): FriendItem[] =>
    friends.map((friend) =>
      friend.user.id === payload.userId
        ? { ...friend, user: { ...friend.user, isOnline: payload.isOnline } }
        : friend,
    );

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

  useEffect(() => {
    const handleFriendOnlineStatusChanged = (
      payload: FriendOnlineStatusChangedPayload,
    ) => {
      setFriends((friends) => updateFriendsOnlineStatus(friends, payload));
    };

    socket.on(
      ServerPrivateEvents.FRIEND_ONLINE_STATUS_CHANGED,
      handleFriendOnlineStatusChanged,
    );

    return () => {
      socket.off(
        ServerPrivateEvents.FRIEND_ONLINE_STATUS_CHANGED,
        handleFriendOnlineStatusChanged,
      );
    };
  }, [socket]);

  return {
    friends,
    friendsLoading: loading,
    setFriends,
  };
};
