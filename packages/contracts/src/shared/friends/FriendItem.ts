import type {
  FriendshipDirection,
  FriendshipStatus,
} from "@exploding-cats/contracts";

export type FriendItem = {
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
    isOnline: boolean;
    lastSeenAt: Date | null;
  };
  status: FriendshipStatus;
  direction: FriendshipDirection;
};
