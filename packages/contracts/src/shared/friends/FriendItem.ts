import type {
  FriendshipDirection,
  FriendshipStatus,
  FriendUser,
} from "@exploding-cats/contracts";

export type FriendItem = {
  user: FriendUser;
  status: FriendshipStatus;
  direction: FriendshipDirection;
};
