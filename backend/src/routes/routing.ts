// Libraries
import type { Express, Router } from "express";
// Project level
import { errorMiddleware } from "middlewares";
// Local level
import { authRouter } from "./auth";
import { docsRouter } from "./docs";
import { usersRouter } from "./users";
import { meRouter } from "./me";
import { metricsRouter } from "./metrics";
import { friendsRouter } from "./friends";
import { gamesRouter } from "./games";

function mountRouter(app: Express, path: string, router: Router) {
  app.use(
    path,
    (req, res, next) => {
      res.locals["metricsRouteBase"] = req.baseUrl;
      next();
    },
    router,
  );
}

export const setupRouting = (app: Express) => {
  app.get("/", (_, res) => {
    return res.json({ message: "Hello world!" });
  });

  mountRouter(app, "/metrics", metricsRouter);
  mountRouter(app, "/docs", docsRouter);
  mountRouter(app, "/auth", authRouter);
  mountRouter(app, "/users", usersRouter);
  mountRouter(app, "/me", meRouter);
  mountRouter(app, "/me/friends", friendsRouter);
  mountRouter(app, "/games", gamesRouter);

  app.use((_, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use(errorMiddleware);
};
