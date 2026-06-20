import api from "api";
import type { FriendItem } from "pages/ProfilePage/types";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { FriendshipStatus, type FriendshipRequestAction } from "types";
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

  const updateFriendship = async (
    action: FriendshipRequestAction,
    selectedFriend: FriendItem,
  ) => {
    try {
      const friendId = selectedFriend.user.id;
      await api.friends.updateFriendship({ action }, { userId: friendId });

      setFriends((prev) =>
        prev.map((friend) =>
          friend.user.id === friendId
            ? { ...friend, status: FriendshipStatus.ACCEPTED }
            : friend,
        ),
      );

      toast.success("Success");
    } catch (error) {
      const errmsg = getErrorMessage(error);
      toast.error(errmsg);
    }
  };

  const acceptFriendship = async (friend: FriendItem) => {
    await updateFriendship("accept", friend);
  };

  const rejectFriendship = async (friend: FriendItem) => {
    await updateFriendship("reject", friend);
  };

  const handleDeleteFriendship = async (selectedFriend: FriendItem) => {
    const friendId = selectedFriend.user.id;

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
