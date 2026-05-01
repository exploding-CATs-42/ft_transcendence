import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import pino from "pino-http";
import prettyFormat from "pino-pretty";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { corsOptions, ioOptions } from "./config";
import { setupRouting } from "./routes";
import { initSockets } from "./sockets";

const app = express();
const server = createServer(app);
const io = new Server(server, ioOptions);

app.use(pino(prettyFormat()));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

setupRouting(app);
initSockets(io);

export default server;
