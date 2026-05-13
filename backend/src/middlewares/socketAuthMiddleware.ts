import { verifyAccessToken } from "../utils/jwt";
import { ExtendedError, Socket } from "socket.io";

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void
) {
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
}
