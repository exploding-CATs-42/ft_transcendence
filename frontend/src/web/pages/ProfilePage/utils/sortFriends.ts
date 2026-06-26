import { FriendshipStatus, type FriendItem } from "@exploding-cats/contracts";

const statusPriority: Record<FriendshipStatus, number> = {
  [FriendshipStatus.ACCEPTED]: 0,
  [FriendshipStatus.PENDING]: 1,
  [FriendshipStatus.REJECTED]: 2,
};

export const sortFriends = (friends: FriendItem[]) =>
  [...friends].sort((a, b) => {
    const priorityA = statusPriority[a.status];
    const priorityB = statusPriority[b.status];

    if (priorityA < priorityB) return -1;
    if (priorityA > priorityB) return 1;

    const usernameA = a.user.username;
    const usernameB = b.user.username;

    return usernameA.localeCompare(usernameB);
  });
