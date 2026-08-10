import {
  FriendOnlineStatusChangedPayload,
  ServerPrivateEvents,
  UserId,
} from "@exploding-cats/contracts";
import { listOnlineStatusRecipientIds } from "services";
import { emitToPlayer } from "sockets/emitters";

export async function broadcastOnlineStatusToFriends(
  userId: UserId,
  isOnline: boolean,
) {
  const recipientIds = await listOnlineStatusRecipientIds(userId);
  const privatePayload: FriendOnlineStatusChangedPayload = { userId, isOnline };

  recipientIds.forEach((friendId) => {
    emitToPlayer(
      friendId,
      ServerPrivateEvents.FRIEND_ONLINE_STATUS_CHANGED,
      privatePayload,
    );
  });
}
