// Libraries
import { useFriendsActions, useModal } from "hooks";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
// Project level
import { Button, ConfirmPopup, List, SearchInput } from "components";
import type { FriendItem, UserId } from "@exploding-cats/contracts";
// Local level
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

  const friendActions = isMyProfile
    ? {
        remove: handleRemoveClick,
        accept: acceptFriendship,
        reject: rejectFriendship,
      }
    : undefined;

  return (
    <>
      <List
        items={sortedFriends}
        getKey={(friend) => friend.user.id}
        renderItem={(friend) => (
          <FriendListItem friend={friend} friendActions={friendActions} />
        )}
        className={s.list}
        empty="No friends yet"
      />
      {isMyProfile && (
        <>
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
      )}
    </>
  );
};

export default FriendsTab;
