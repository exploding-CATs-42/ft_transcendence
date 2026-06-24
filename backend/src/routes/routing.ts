// Libraries
import type { Express } from "express";
// Project level
import { apiRateLimiter, errorMiddleware } from "middlewares";
// Local level
import { authRouter } from "./auth";
import { docsRouter } from "./docs";
import { usersRouter } from "./users";
import { meRouter } from "./me";
import { friendsRouter } from "./friends";
import { gamesRouter } from "./games";

export const setupRouting = (app: Express) => {
  app.use(apiRateLimiter);

  app.get("/", (_, res) => {
    return res.json({ message: "Hello world!" });
  });

  app.use("/docs", docsRouter);
  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/me", meRouter);
  app.use("/me/friends", friendsRouter);
  app.use("/games", gamesRouter);

  app.use((_, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use(errorMiddleware);
};
