import express, { Request, Response, NextFunction } from "express";
import pino from "pino-http";
import prettyFormat from "pino-pretty";
import cors, { CorsOptions } from "cors";
import { HttpError } from "http-errors";
import "dotenv/config";
import { docsRouter } from "./routes/docsRouter/docsRouter";

const { FRONTEND_URL = "*" } = process.env;

const corsOptions: CorsOptions = {
  origin: FRONTEND_URL,
  optionsSuccessStatus: 200
};

const app = express();

app.use(pino(prettyFormat()));
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (_, res) => {
  return res.json({ message: "Hello world!" });
});

app.use("/docs", docsRouter);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error: unknown, _: Request, res: Response, __: NextFunction) => {
  if (error instanceof HttpError)
    return res.status(error.status).json({ message: error.message });

  return res.status(500).json({ message: "Server error" });
});

export default app;
