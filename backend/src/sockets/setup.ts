// Libraries
import { Server, Socket } from "socket.io";
// Project level
import { socketAuthMiddleware } from "middlewares";
import { UserId } from "@exploding-cats/contracts";
// Local level
import { registerGameEventHandlers } from "./listeners";
import { broadcastOnlineStatusToFriends } from "./broadcasters";

export const initSockets = (io: Server) => {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);
    const userId: UserId = socket.data.user.id;

    socket.join(userId);
    broadcastOnlineStatusToFriends(userId, true);

    // Register feature-specific handlers
    registerGameEventHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      broadcastOnlineStatusToFriends(userId, false);
    });
  });
};
