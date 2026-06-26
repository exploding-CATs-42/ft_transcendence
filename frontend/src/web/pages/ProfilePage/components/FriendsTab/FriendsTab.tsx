// Libraries
import { useFriendsActions, useModal } from "hooks";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "react-toastify";
// Project level
import { ConfirmPopup, List } from "components";
import type { FriendItem, UserId } from "@exploding-cats/contracts";
import { getErrorMessage } from "utils";
// Local level
import { FriendListItem, FriendshipSearchForm } from "../../components";
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
  const {
    handleDeleteFriendship,
    handleCreateFriendship,
    acceptFriendship,
    rejectFriendship,
  } = useFriendsActions({ setFriends });

  const sortedFriends = useMemo(() => sortFriends(friends), [friends]);

  const handleRemoveClick = (friendId: UserId) => {
    setSelectedFriendId(friendId);
    toggleModal();
  };

  const handleDeleteClick = async () => {
    try {
      if (selectedFriendId) await handleDeleteFriendship(selectedFriendId);
      toggleModal();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleAcceptClick = async (friendId: string) => {
    try {
      await acceptFriendship(friendId);
      toast.success("Success");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRejectClick = async (friendId: string) => {
    try {
      await rejectFriendship(friendId);
      toast.success("Success");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const friendActions = isMyProfile
    ? {
        remove: handleRemoveClick,
        accept: handleAcceptClick,
        reject: handleRejectClick,
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
          <FriendshipSearchForm onSubmit={handleCreateFriendship} />

          <ConfirmPopup
            toggleModal={toggleModal}
            isOpenModal={isOpenModal}
            msg="Are you sure you want to remove your friend?"
            onConfirm={() => {
              handleDeleteClick();
            }}
          />
        </>
      )}
    </>
  );
};

export default FriendsTab;
