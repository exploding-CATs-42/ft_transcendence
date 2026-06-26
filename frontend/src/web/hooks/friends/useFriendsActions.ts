// Libraries
import type { Dispatch, SetStateAction } from "react";
// Project level
import {
  FriendshipStatus,
  type FriendItem,
  type FriendshipRequestAction,
  type UserId,
} from "@exploding-cats/contracts";
import api from "api";

interface Props {
  setFriends: Dispatch<SetStateAction<FriendItem[]>>;
}

export const useFriendsActions = ({ setFriends }: Props) => {
  const handleCreateFriendship = async (searchQuery: string) => {
    await api.friends.createFriendRequest({ userId: searchQuery });
  };

  const actionToStatus: Record<FriendshipRequestAction, FriendshipStatus> = {
    accept: FriendshipStatus.ACCEPTED,
    reject: FriendshipStatus.REJECTED,
  };

  const acceptFriendship = async (friendId: UserId) => {
    const action: FriendshipRequestAction = "accept";

    await api.friends.updateFriendship({ action }, { userId: friendId });

    setFriends((prev) =>
      prev.map((friend) =>
        friend.user.id === friendId
          ? { ...friend, status: actionToStatus[action] }
          : friend,
      ),
    );
  };

  const rejectFriendship = async (friendId: UserId) => {
    const action: FriendshipRequestAction = "reject";

    await api.friends.updateFriendship({ action }, { userId: friendId });

    setFriends((prev) => prev.filter((friend) => friend.user.id !== friendId));
  };

  const handleDeleteFriendship = async (friendId: UserId) => {
    await api.friends.deleteFriendship({ userId: friendId });
    setFriends((prev) => prev.filter((friend) => friend.user.id !== friendId));
  };

  return {
    handleDeleteFriendship,
    handleCreateFriendship,
    acceptFriendship,
    rejectFriendship,
  };
};
