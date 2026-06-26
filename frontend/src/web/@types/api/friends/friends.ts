import type { UserId } from "@exploding-cats/contracts";
import type { FriendshipRequestAction } from "constants";

export type FriendshipRequestAction =
  (typeof FriendshipRequestAction)[keyof typeof FriendshipRequestAction];

export interface UpdateFriendshipBody {
  action: FriendshipRequestAction;
}

export interface UserIdBody {
  userId: UserId;
}

export const FriendshipDirection = {
  OUTGOING: "outgoing",
  INCOMING: "incoming",
} as const;

export type FriendshipDirection =
  (typeof FriendshipDirection)[keyof typeof FriendshipDirection];

export const FriendshipStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
} as const;

export type FriendshipStatus =
  (typeof FriendshipStatus)[keyof typeof FriendshipStatus];
