export const FriendshipRequestAction = {
  ACCEPT: "accept",
  REJECT: "reject",
} as const;

export type FriendshipRequestAction =
  (typeof FriendshipRequestAction)[keyof typeof FriendshipRequestAction];
