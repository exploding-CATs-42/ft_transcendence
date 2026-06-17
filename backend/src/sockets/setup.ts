// Libraries
import { Server, Socket } from "socket.io";
// Project level
import { socketAuthMiddleware } from "middlewares";
// Local level
import { registerChatHandlers, lobbyGameHandlers } from "./listeners";

export const initSockets = (io: Server) => {
  io.use(socketAuthMiddleware);

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
