import type { UserId } from "@exploding-cats/shared-types";
import type { FriendshipRequestAction } from "constants";

export type FriendshipRequestAction =
  (typeof FriendshipRequestAction)[keyof typeof FriendshipRequestAction];

export interface UpdateFriendshipBody {
  action: FriendshipRequestAction;
}

export interface UserIdBody {
  userId: UserId;
}
