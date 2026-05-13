import { Server, Socket } from "socket.io";
import { registerChatHandlers } from "./chat";
import { registerGameHandlers } from "./game";

export const initSockets = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // Register feature-specific handlers
    registerChatHandlers(io, socket);
    registerGameHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
