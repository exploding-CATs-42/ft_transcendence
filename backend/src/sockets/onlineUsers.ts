import { Server } from "socket.io";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let io: Server | null = null;

export const initOnlineUsers = (server: Server) => {
  io = server;
};
