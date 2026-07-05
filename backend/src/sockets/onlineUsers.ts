import { Server } from "socket.io";
import { UserId } from "@exploding-cats/contracts";

let io: Server | null = null;

export const initOnlineUsers = (server: Server) => {
  io = server;
};

export const isUserOnline = (userId: UserId) => {
  if (!io) {
    throw new Error("onlineUsers is not initialized");
  }

  return io.sockets.adapter.rooms.has(userId);
};
