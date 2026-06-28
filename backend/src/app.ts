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
import { restoreGames } from "./startup";
import { initGamePersistence } from "./data";
import { httpMetricsMiddleware } from "middlewares/express/httpMetricsMiddleware";
import { userOperationMetricsMiddleware } from "middlewares/express/userOperationMetricsMiddleware";
import { apiRateLimiter } from "middlewares";

const app = express();
const server = createServer(app);
export const io = new Server(server, ioOptions);

restoreGames();
initGamePersistence();

app.use(pino(prettyFormat()));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(httpMetricsMiddleware);
app.use(userOperationMetricsMiddleware);
app.use(apiRateLimiter);
app.set("trust proxy", 1);

setupRouting(app);
initSockets(io);

export default server;
