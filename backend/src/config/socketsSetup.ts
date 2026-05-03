import { ServerOptions } from "socket.io";
import { corsOptions } from "./cors";

export const ioOptions: Partial<ServerOptions> = {
  cors: corsOptions
};
