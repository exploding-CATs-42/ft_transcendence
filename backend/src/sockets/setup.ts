import { Server, Socket } from "socket.io";
import { registerChatHandlers } from "./chat";
import { verifyAccessToken } from "../utils/jwt";

export const initSockets = (io: Server) => {
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth["token"];

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const payload = verifyAccessToken(token);

      socket.data = payload;

      next();
    } catch (_) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // Register feature-specific handlers
    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
