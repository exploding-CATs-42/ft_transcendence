import {
  FriendOnlineStatusChangedPayload,
  ServerPrivateEvents,
  UserId,
} from "@exploding-cats/contracts";
import { io } from "../../app";
import { listFriendIds } from "services";

export async function broadcastOnlineStatusToFriends(
  userId: UserId,
  isOnline: boolean,
) {
  const friendIds = await listFriendIds(userId);
  const privatePayload: FriendOnlineStatusChangedPayload = { userId, isOnline };

  friendIds.forEach((friendId) => {
    io.to(friendId).emit(
      ServerPrivateEvents.FRIEND_ONLINE_STATUS_CHANGED,
      privatePayload,
    );
  });
}
