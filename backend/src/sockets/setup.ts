// Libraries
import { Server, Socket } from "socket.io";
// Project level
import { socketAuthMiddleware } from "middlewares";
import { UserId } from "@exploding-cats/contracts";
// Local level
import { registerGameEventHandlers } from "./listeners";
import {
  broadcastOnlineStatusToFriends,
  broadcastPlayerDisconnected,
  broadcastPlayerReconnected,
} from "./broadcasters";
import { isUserOnline } from "./onlineUsers";
import { cancelAutoPlay, startAutoPlayForCurrentTurnPlayer } from "./autoPlay";

export const initSockets = (io: Server) => {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket) => {
    const userId: UserId = socket.data.user.id;

    const cameOnline = !isUserOnline(userId);
    socket.join(userId);
    if (cameOnline) {
      broadcastOnlineStatusToFriends(userId, true);
      broadcastPlayerReconnected(userId);
      cancelAutoPlay(userId);
    }

    // Register feature-specific handlers
    registerGameEventHandlers(io, socket);

    socket.on("disconnect", () => {
      const wentOffline = !isUserOnline(userId);
      if (wentOffline) {
        broadcastOnlineStatusToFriends(userId, false);
        broadcastPlayerDisconnected(userId);
        startAutoPlayForCurrentTurnPlayer(userId);
      }
    });
  });
};
