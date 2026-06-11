import type { Express } from "express";
import { errorMiddleware } from "../middlewares";
import { docsRouter } from "./docs";
import { usersRouter } from "./users";
import { meRouter } from "./me";
import { metricsRouter } from "./metrics";
import { friendsRouter } from "./friends";
import { gamesRouter } from "./games";

export const setupRouting = (app: Express) => {
  app.get("/", (_, res) => {
    return res.json({ message: "Hello world!" });
  });

  app.use("/metrics", metricsRouter);
  app.use("/docs", docsRouter);
  app.use("/users", usersRouter);
  app.use("/me", meRouter);
  app.use("/me/friends", friendsRouter);
  app.use("/games", gamesRouter);

  app.use((_, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use(errorMiddleware);
};
