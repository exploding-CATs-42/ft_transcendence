import { Server, Socket } from "socket.io";
import { handleSendMessage } from "../services/chatService";

export const registerChatHandlers = (io: Server, socket: Socket) => {
  socket.on("send_message", async (data) => {
    try {
      const message = await handleSendMessage(data);

      io.emit("receive_message", message);
    } catch (_) {
      socket.emit("error_message", { message: "Failed to send message" });
    }
  });
};
