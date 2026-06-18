// Libraries
import { Socket } from "socket.io";
// Project level
import { UserId } from "@exploding-cats/contracts";

export const socketsMap = new Map<UserId, Socket>();
