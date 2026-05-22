// Project level
import { Avatar, Button, ConfirmPopup, Icon, ListItem } from "components";
//Local level
import s from "./FriendListItem.module.css";
import { useModal } from "hooks";

export type FriendItem = {
  user: {
    id: string;
    username: string;
    avatarUrl: string;
    isOnline: boolean;
    lastSeenAt: Date;
  };
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  direction: "outgoing" | "incoming" | "accepted";
};

interface Props {
  friend: FriendItem;
}

const FriendListItem = ({ friend }: Props) => {
  const [isOpenModal, toggleModal] = useModal();

  const handleRemoveFriend = (friend: FriendItem) => {
    console.log("remove friend", friend.user.id);

    toggleModal();
  };

  return (
    <ListItem>
      <div className={s.container}>
        <div className={s.leftContent}>
          <Avatar
            variant="friend"
            src={friend.user.avatarUrl}
            alt={`${friend.user.username} avatar`}
          />

          <div className={s.infoContainer}>
            <span className={s.username}>{friend.user.username}</span>

            <span className={s.status}>
              {friend.user.isOnline ? "online" : "offline"}
            </span>
          </div>
        </div>

        <div className={s.rightContent}>
          {friend.status === "ACCEPTED" ? (
            <Button className={s.closeButton} onClick={() => toggleModal()}>
              <Icon name="cross" stroke="black" width={20} height={20} />
            </Button>
          ) : (
            <>
              <Button className={s.button}>Accept</Button>
              <Button className={s.button}>Ignore</Button>
            </>
          )}
        </div>
      </div>
      <ConfirmPopup
        toggleModal={toggleModal}
        isOpenModal={isOpenModal}
        msg="Are you sure you want to remove your friend?"
        onConfirm={() => {
          handleRemoveFriend(friend);
        }}
      />
    </ListItem>
  );
};

export default FriendListItem;
