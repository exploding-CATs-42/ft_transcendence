export const FriendshipDirection = {
  OUTGOING: "outgoing",
  INCOMING: "incoming",
} as const;

export type FriendshipDirection =
  (typeof FriendshipDirection)[keyof typeof FriendshipDirection];
