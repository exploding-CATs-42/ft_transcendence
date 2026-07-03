// Libraries
import { ExtendedError, Socket } from "socket.io";
// Project level
import { verifyAccessToken } from "utils";

export function authMiddleware(
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void,
) {
  try {
    const token = socket.handshake.auth["token"];

    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    const payload = verifyAccessToken(token);

    socket.data.user = {
      id: payload.sub,
    };

    next();
  } catch (_) {
    next(new Error("Invalid token"));
  }
}
