import express from "express";
import cookieParser from "cookie-parser";
import pino from "pino-http";
import prettyFormat from "pino-pretty";
import cors, { CorsOptions } from "cors";
import "dotenv/config";
import { setupRouting } from "./routes/routing";

const { FRONTEND_URL = "*" } = process.env;

const corsOptions: CorsOptions = {
  origin: FRONTEND_URL === "*" ? true : FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
};

const app = express();

app.use(pino(prettyFormat()));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

setupRouting(app);

export default app;
