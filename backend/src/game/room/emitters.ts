import { Server } from "socket.io";

export const createEmitters = (
  io: Server,
  channel: string,
  socketByPlayer: Record<string, string>
) => ({
  emitToRoom: (event: string, payload: unknown) => {
    io.to(channel).emit(event, payload);
  },
  emitToPlayer: (playerId: string, event: string, payload: unknown) => {
    const socketId = socketByPlayer[playerId];
    if (socketId) io.to(socketId).emit(event, payload);
  }
});

export type Emitters = ReturnType<typeof createEmitters>;
