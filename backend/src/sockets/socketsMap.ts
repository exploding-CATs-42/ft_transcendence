// Libraries
import { Socket } from "socket.io";
// Project level
import { PlayerId } from "types";

export const socketsMap = new Map<PlayerId, Socket>();
