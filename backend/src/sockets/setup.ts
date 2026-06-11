// Libraries
import { Server, Socket } from "socket.io";
// Project level
import { socketAuthMiddleware } from "middlewares";
import { setIoForBroadcaster } from "game";
// Local level
import { lobbyGameHandlers } from "./game";
import { registerChatHandlers } from "./chat";

export const initSockets = (io: Server) => {
  io.use(socketAuthMiddleware);
  setIoForBroadcaster(io);

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // Register feature-specific handlers
    registerChatHandlers(io, socket);
    lobbyGameHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
