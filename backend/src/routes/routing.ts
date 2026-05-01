import type { Express, Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";
import { docsRouter } from "./docs";
import { usersRouter } from "./users";

export const setupRouting = (app: Express) => {
  app.get("/", (_, res) => {
    return res.json({ message: "Hello world!" });
  });

  app.use("/docs", docsRouter);
  app.use("/users", usersRouter);

  app.use((_, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use((error: unknown, _: Request, res: Response, __: NextFunction) => {
    if (error instanceof HttpError)
      return res.status(error.status).json({ message: error.message });

    console.error("Unhandled error:", error);
    return res.status(500).json({ message: "Server error" });
  });
};
