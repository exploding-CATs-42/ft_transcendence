import { useFriendsActions, useModal } from "hooks";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

import { Button, ConfirmPopup, List, SearchInput } from "components";
import type { UserId } from "@exploding-cats/contracts";

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
  const [selectedFriendId, setSelectedFriendId] = useState<UserId | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const {
    handleDeleteFriendship,
    handleCreateFriendship,
    acceptFriendship,
    rejectFriendship,
  } = useFriendsActions({ setFriends, toggleModal });

  const sortedFriends = useMemo(() => sortFriends(friends), [friends]);

  const handleRemoveClick = (friendId: UserId) => {
    setSelectedFriendId(friendId);
    toggleModal();
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
        <Button
          className={s.button}
          onClick={() => {
            handleCreateFriendship(searchQuery);
          }}
        >
          Add
        </Button>
      </div>

      <ConfirmPopup
        toggleModal={toggleModal}
        isOpenModal={isOpenModal}
        msg="Are you sure you want to remove your friend?"
        onConfirm={() => {
          if (selectedFriendId) {
            handleDeleteFriendship(selectedFriendId);
          }
        }}
      />
    </>
  );
};

export default FriendsTab;
