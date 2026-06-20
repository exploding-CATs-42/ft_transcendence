//Project level
import type { UserId } from "@exploding-cats/shared-types";
import { Button, Icon } from "components";
//Local level
import type { FriendItem } from "pages/ProfilePage/types";
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
  return (
    <>
      <div className={s.rightContent}>
        {friend.status === "ACCEPTED" ? (
          <Button
            className={s.closeButton}
            onClick={() => {
              friendActions?.remove(friend.user.id);
            }}
          >
            <Icon name="cross" stroke="black" width={20} height={20} />
          </Button>
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
