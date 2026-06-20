// Project level
import { Avatar, ListItem } from "components";
import type { UserId } from "@exploding-cats/shared-types";
//Local level
import s from "./FriendListItem.module.css";
import type { FriendItem } from "pages/ProfilePage/types";
import FriendControl from "../FriendControl/FriendControl";

interface Props {
  friend: FriendItem;
  friendActions:
    | {
        remove: (friendId: UserId) => void;
        accept: (friendId: UserId) => Promise<void>;
        reject: (friendId: UserId) => Promise<void>;
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

        {friendActions && (
          <FriendControl friend={friend} friendActions={friendActions} />
        )}
      </div>
    </ListItem>
  );
};

export default FriendListItem;
