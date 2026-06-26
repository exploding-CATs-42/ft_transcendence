import {
  FriendshipStatus,
  type FriendItem,
  type FriendshipRequestAction,
  type UserId,
} from "@exploding-cats/contracts";
import api from "api";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { getErrorMessage } from "utils";

interface Props {
  setFriends: Dispatch<SetStateAction<FriendItem[]>>;
  toggleModal: () => void;
}

export const useFriendsActions = ({ setFriends, toggleModal }: Props) => {
  const handleCreateFriendship = async (searchQuery: string) => {
    try {
      await api.friends.createFriendRequest({ userId: searchQuery });

      toast.success("Success");
    } catch (error) {
      const errmsg = getErrorMessage(error);
      toast.error(errmsg);
    }
  };

  const actionToStatus: Record<FriendshipRequestAction, FriendshipStatus> = {
    accept: FriendshipStatus.ACCEPTED,
    reject: FriendshipStatus.REJECTED,
  };

  const updateFriendship = async (
    action: FriendshipRequestAction,
    friendId: UserId,
  ) => {
    try {
      await api.friends.updateFriendship({ action }, { userId: friendId });

      setFriends((prev) =>
        prev.map((friend) =>
          friend.user.id === friendId
            ? { ...friend, status: actionToStatus[action] }
            : friend,
        ),
      );

      toast.success("Success");
    } catch (error) {
      const errmsg = getErrorMessage(error);
      toast.error(errmsg);
    }
  };

  const acceptFriendship = async (friendId: UserId) => {
    await updateFriendship("accept", friendId);
  };

  const rejectFriendship = async (friendId: UserId) => {
    await updateFriendship("reject", friendId);
  };

  const handleDeleteFriendship = async (friendId: UserId) => {
    try {
      await api.friends.deleteFriendship({ userId: friendId });
      toggleModal();

      setFriends((prev) =>
        prev.filter((friend) => friend.user.id !== friendId),
      );

      toast.success("Success");
    } catch (error) {
      const errmsg = getErrorMessage(error);
      toast.error(errmsg);
    }
  };

  return {
    handleDeleteFriendship,
    handleCreateFriendship,
    acceptFriendship,
    rejectFriendship,
  };
};
