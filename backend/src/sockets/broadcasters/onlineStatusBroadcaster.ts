import {
  FriendOnlineStatusChangedPayload,
  ServerPrivateEvents,
  UserId,
} from "@exploding-cats/contracts";
import { io } from "../../app";
import { listOnlineStatusRecipientIds } from "services";

export async function broadcastOnlineStatusToFriends(
  userId: UserId,
  isOnline: boolean,
) {
  const recipientIds = await listOnlineStatusRecipientIds(userId);
  const privatePayload: FriendOnlineStatusChangedPayload = { userId, isOnline };

  recipientIds.forEach((friendId) => {
    io.to(friendId).emit(
      ServerPrivateEvents.FRIEND_ONLINE_STATUS_CHANGED,
      privatePayload,
    );
  });
}
