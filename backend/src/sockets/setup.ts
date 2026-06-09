import { Server, Socket } from "socket.io";
import { registerChatHandlers } from "./chat";
import { socketAuthMiddleware } from "../middlewares";
import { lobbyGameHandlers } from "./game";
import { setIoForBroadcaster } from "../game/broadcaster";

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
