import { useModal } from "hooks";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "react-toastify";

import api from "api";
import { getErrorMessage } from "utils";
import { Button, ConfirmPopup, List, SearchInput } from "components";
import { FriendshipStatus, type FriendshipRequestAction } from "types";

import type { FriendItem } from "../../types";
import { FriendListItem } from "../../components";
import { sortFriends } from "../../utils";
import s from "./FriendsTab.module.css";

interface Props {
  friends: FriendItem[];
  setFriends: Dispatch<SetStateAction<FriendItem[]>>;
  isMyProfile: boolean;
}

const FriendsTab = ({ friends, setFriends, isMyProfile }: Props) => {
  const [isOpenModal, toggleModal] = useModal();
  const [selectedFriend, setSelectedFriend] = useState<FriendItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const sortedFriends = useMemo(() => sortFriends(friends), [friends]);

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
      setSearchQuery("");
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

  const friendActions = {
    remove: handleRemoveClick,
    accept: acceptFriendship,
    reject: rejectFriendship,
  };

  return (
    <>
      <List
        items={sortedFriends}
        getKey={(friend) => friend.user.id}
        renderItem={(friend) => (
          <FriendListItem
            friend={friend}
            friendActions={isMyProfile ? friendActions : undefined}
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
