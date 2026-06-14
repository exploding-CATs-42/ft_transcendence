import { Button, List, SearchInput } from "components";

import type { FriendItem } from "../../types";
import { FriendListItem } from "../../components";
import s from "./FriendsTab.module.css";

interface Props {
  friends: FriendItem[];
}

const FriendsTab = ({ friends }: Props) => {
  const sortedFriends = [...friends].sort((a, b) => {
    const statusOrder = {
      ACCEPTED: 0,
      PENDING: 1,
      REJECTED: 2,
    };

    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[b.status] - statusOrder[a.status];
    }
    return a.user.username.localeCompare(b.user.username);
  });

  return (
    <>
      <List
        items={sortedFriends}
        getKey={(friend) => friend.user.id}
        renderItem={(friend) => <FriendListItem friend={friend} />}
        className={s.list}
        empty="No friends yet"
      />
      <div className={s.footer}>
        <SearchInput />
        <Button className={s.button}>Add</Button>
      </div>
    </>
  );
};

export default FriendsTab;
