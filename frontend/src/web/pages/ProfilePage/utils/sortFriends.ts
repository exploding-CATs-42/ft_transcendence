import { FriendshipStatus, type FriendItem } from "@exploding-cats/contracts";

const statusOrder: Record<FriendshipStatus, number> = {
  [FriendshipStatus.ACCEPTED]: 0,
  [FriendshipStatus.PENDING]: 1,
  [FriendshipStatus.REJECTED]: 2,
};

export const sortFriends = (friends: FriendItem[]) =>
  [...friends].sort((a, b) => {
    const diff = statusOrder[a.status] - statusOrder[b.status];

    if (diff !== 0) return diff;

    return a.user.username.localeCompare(b.user.username);
  });
