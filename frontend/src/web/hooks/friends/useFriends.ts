import { useState } from "react";

import type { FriendItem } from "pages/ProfilePage/types";

export const useFriends = () => {
  const [friends, _setFriends] = useState<FriendItem[]>([]);

  return { friends };
};
