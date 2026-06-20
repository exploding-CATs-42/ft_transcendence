// Project level
import { Avatar, Button, Icon, ListItem } from "components";
//Local level
import s from "./FriendListItem.module.css";
import type { FriendItem } from "pages/ProfilePage/types";

interface Props {
  friend: FriendItem;
  friendActions:
    | {
        remove: (friend: FriendItem) => void;
        accept: (friend: FriendItem) => Promise<void>;
        reject: (friend: FriendItem) => Promise<void>;
      }
    | undefined;
}

const FriendListItem = ({ friend, friendActions }: Props) => {
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
                friendActions?.remove(friend);
              }}
            >
              <Icon name="cross" stroke="black" width={20} height={20} />
            </Button>
          ) : (
            <>
              <Button
                className={s.button}
                onClick={() => {
                  friendActions?.accept(friend);
                }}
              >
                Accept
              </Button>
              <Button
                className={s.button}
                onClick={() => {
                  friendActions?.reject(friend);
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
