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

export const initSockets = (io: Server) => {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);
    const userId: UserId = socket.data.user.id;

    const cameOnline = !isUserOnline(userId);
    socket.join(userId);
    if (cameOnline) {
      broadcastOnlineStatusToFriends(userId, true);
      broadcastPlayerReconnected(userId);
    }

    // Register feature-specific handlers
    registerGameEventHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      const wentOffline = !isUserOnline(userId);
      if (wentOffline) {
        broadcastOnlineStatusToFriends(userId, false);
        broadcastPlayerDisconnected(userId);
      }
    });
  });
};
