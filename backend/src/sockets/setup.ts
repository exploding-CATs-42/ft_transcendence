import { Server, Socket } from "socket.io";
import { registerChatHandlers } from "./chat";
import { socketMiddleware } from "../middlewares/socketMiddleware";

export const initSockets = (io: Server) => {
  io.use((socket: Socket, next) => {
    socketMiddleware(socket, next);
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
