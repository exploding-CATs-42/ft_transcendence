import { Server, Socket } from "socket.io";
import { registerChatHandlers } from "./chat";
import { authMiddleware } from "../middlewares/sockets/authMiddleware";

export const initSockets = (io: Server) => {
  io.use(authMiddleware);

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // Register feature-specific handlers
    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
