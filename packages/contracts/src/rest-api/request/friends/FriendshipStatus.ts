export const FriendshipStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
} as const;

export type FriendshipStatus =
  (typeof FriendshipStatus)[keyof typeof FriendshipStatus];
