import express, { Request, Response, NextFunction } from "express";
import pino from "pino-http";
import prettyFormat from "pino-pretty";
import cors, { CorsOptions } from "cors";
import { HttpError } from "http-errors";
import "dotenv/config";
import { docsRouter } from "./routes/docsRouter/docsRouter";
import { usersRouter } from "./routes/usersRouter/usersRouter";
import { meRouter } from "./routes/meRouter/meRouter";
import { friendsRouter } from "./routes/friendsRouter/friendsRouter";

const { CORS_ORIGIN = "*" } = process.env;

const corsOptions: CorsOptions = {
  origin: CORS_ORIGIN,
  optionsSuccessStatus: 200,
};

const app = express();

app.use(pino(prettyFormat()));
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (_req, res) => {
  return res.json({ message: "Hello world!" });
});

app.use("/docs", docsRouter);
app.use("/users", usersRouter);
app.use("/me", meRouter);
app.use("/me/friends", friendsRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }

  return res.status(500).json({ message: "Server error" });
});

export default app;