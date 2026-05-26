import { Server } from "socket.io";
import { PrivateEventType, PublicEventType } from "../../types";

export const createEmitters = (
  io: Server,
  room: string,
  socketByPlayer?: Record<string, string>,
) => ({
  emitToRoom: (event: PublicEventType, payload: unknown) => {
    io.to(room).emit(event, payload);
  },
  emitToPlayer: (id: string, event: PrivateEventType, payload: unknown) => {
    const socketId = socketByPlayer?.[id];
    if (socketId) {
      io.to(socketId).emit(event, payload);
    }
  },
});

export type Emitters = ReturnType<typeof createEmitters>;
