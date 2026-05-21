// Project level
import { Avatar, Button, ListItem } from "components";
//Local level
import s from "./FriendListItem.module.css";

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
  return (
    <ListItem>
      <div className={s.container}>
        <div className={s.leftContent}>
          <Avatar
            variant="friend"
            src={friend.avatarUrl}
            alt={`${friend.username} avatar`}
          />
          <div className={s.infoContainer}>
            <span className={s.username}>{friend.username}</span>
            <span className={s.status}>
              {friend.isOnline ? "online" : "offline"}
            </span>
          </div>
        </div>
        <div className={s.rightContent}>
          <Button className={s.button}>Accept</Button>
          <Button className={s.button}>Ignore</Button>
        </div>
      </div>
    </ListItem>
  );
};

export default FriendListItem;
