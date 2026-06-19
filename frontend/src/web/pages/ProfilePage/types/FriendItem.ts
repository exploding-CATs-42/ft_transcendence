import type { FriendshipDirection, FriendshipStatus } from "types";

export type FriendItem = {
  user: {
    id: string;
    username: string;
    avatarUrl: string;
    isOnline: boolean;
    lastSeenAt: Date;
  };
  status: FriendshipStatus;
  direction: FriendshipDirection;
};
