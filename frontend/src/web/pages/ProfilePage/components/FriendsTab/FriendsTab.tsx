import { useModal } from "hooks";
import { useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "react-toastify";

import api from "api";
import { getErrorMessage } from "utils";
import { Button, ConfirmPopup, List, SearchInput } from "components";
import { type FriendshipRequestAction } from "types";

import type { FriendItem } from "../../types";
import { FriendListItem } from "../../components";
import s from "./FriendsTab.module.css";

interface Props {
  friends: FriendItem[];
  setFriends: Dispatch<SetStateAction<FriendItem[]>>;
}

const FriendsTab = ({ friends, setFriends }: Props) => {
  const [isOpenModal, toggleModal] = useModal();
  const [selectedFriend, setSelectedFriend] = useState<FriendItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const sortedFriends = [...friends].sort((a, b) => {
    const statusOrder = {
      ACCEPTED: 0,
      PENDING: 1,
      REJECTED: 2,
    };

    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[b.status] - statusOrder[a.status];
    }
    return a.user.username.localeCompare(b.user.username);
  });

  const handleRemoveClick = (friend: FriendItem) => {
    setSelectedFriend(friend);
    toggleModal();
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

  const handleCreateFriendship = async () => {
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
            ? { ...friend, status: "ACCEPTED" }
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

  return (
    <>
      <List
        items={sortedFriends}
        getKey={(friend) => friend.user.id}
        renderItem={(friend) => (
          <FriendListItem
            friend={friend}
            handleRemoveClick={handleRemoveClick}
            acceptFriendship={acceptFriendship}
            rejectFriendship={rejectFriendship}
          />
        )}
        className={s.list}
        empty="No friends yet"
      />
      <div className={s.footer}>
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button className={s.button} onClick={handleCreateFriendship}>
          Add
        </Button>
      </div>

      <ConfirmPopup
        toggleModal={toggleModal}
        isOpenModal={isOpenModal}
        msg="Are you sure you want to remove your friend?"
        onConfirm={() => {
          if (selectedFriend) {
            handleDeleteFriendship(selectedFriend);
          }
        }}
      />
    </>
  );
};

export default FriendsTab;
