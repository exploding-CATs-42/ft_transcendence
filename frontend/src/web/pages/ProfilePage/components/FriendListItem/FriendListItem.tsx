// Project level
import { Avatar, Button, Icon, ListItem } from "components";
//Local level
import s from "./FriendListItem.module.css";
import type { FriendItem } from "pages/ProfilePage/types";

interface Props {
  friend: FriendItem;
  handleRemoveClick: (friend: FriendItem) => void;
  acceptFriendship: (friend: FriendItem) => Promise<void>;
  rejectFriendship: (friend: FriendItem) => Promise<void>;
}

const FriendListItem = ({
  friend,
  handleRemoveClick,
  acceptFriendship,
  rejectFriendship,
}: Props) => {
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
            <Button
              className={s.closeButton}
              onClick={() => {
                handleRemoveClick(friend);
              }}
            >
              <Icon name="cross" stroke="black" width={20} height={20} />
            </Button>
          ) : (
            <>
              <Button
                className={s.button}
                onClick={() => {
                  acceptFriendship(friend);
                }}
              >
                Accept
              </Button>
              <Button
                className={s.button}
                onClick={() => {
                  rejectFriendship(friend);
                }}
              >
                Ignore
              </Button>
            </>
          )}
        </div>
      </div>
    </ListItem>
  );
};

export default FriendListItem;
