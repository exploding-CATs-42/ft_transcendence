export const FriendshipView = {
  FRIENDS_AND_REQUESTS: "friends_and_requests",
  INCOMING: "incoming",
  ACCEPTED: "accepted",
} as const;

export type FriendshipView =
  (typeof FriendshipView)[keyof typeof FriendshipView];
