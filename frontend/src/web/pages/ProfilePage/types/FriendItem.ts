export type FriendItem = {
  user: {
    id: string;
    username: string;
    avatarUrl: string;
    isOnline: boolean;
    lastSeenAt: Date;
  };
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  direction: "outgoing" | "incoming" | "accepted";
};
