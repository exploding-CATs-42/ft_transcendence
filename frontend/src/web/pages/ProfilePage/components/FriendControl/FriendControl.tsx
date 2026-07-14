//Project level
import {
  FriendshipDirection,
  FriendshipStatus,
  type FriendItem,
  type UserId,
} from "@exploding-cats/contracts";
import { Button, Icon } from "components";
//Local level
import s from "./FriendControl.module.css";

interface Props {
  friend: FriendItem;
  friendActions: {
    remove: (friendId: UserId) => void;
    accept: (friendId: UserId) => Promise<void>;
    reject: (friendId: UserId) => Promise<void>;
  };
}

const FriendControl = ({ friend, friendActions }: Props) => {
  const isOutgoingPendingRequest =
    friend.status === FriendshipStatus.PENDING &&
    friend.direction === FriendshipDirection.OUTGOING;

  return (
    <>
      <div className={s.rightContent}>
        {friend.status === FriendshipStatus.ACCEPTED ? (
          <Button
            className={s.closeButton}
            onClick={() => {
              friendActions?.remove(friend.user.id);
            }}
          >
            <Icon name="cross" stroke="black" width={20} height={20} />
          </Button>
        ) : isOutgoingPendingRequest ? (
          <span className={s.pending}>Pending</span>
        ) : (
          <>
            <Button
              className={s.button}
              onClick={() => {
                friendActions?.accept(friend.user.id);
              }}
            >
              Accept
            </Button>
            <Button
              className={s.button}
              onClick={() => {
                friendActions?.reject(friend.user.id);
              }}
            >
              Ignore
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default FriendControl;
