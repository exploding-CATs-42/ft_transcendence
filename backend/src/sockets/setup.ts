import { Server, Socket } from "socket.io";
import { registerChatHandlers } from "./chat";

export const initSockets = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // Register feature-specific handlers
    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
