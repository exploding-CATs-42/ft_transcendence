import express from "express";
import cookieParser from "cookie-parser";
import pino from "pino-http";
import prettyFormat from "pino-pretty";
import cors from "cors";
import "dotenv/config";
import { corsOptions } from "./config/cors";
import { setupRouting } from "./routes/routing";

const app = express();

app.use(pino(prettyFormat()));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

setupRouting(app);

export default app;
