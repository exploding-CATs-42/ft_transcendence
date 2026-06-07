import { ErrorRequestHandler } from "express";
import { HttpError } from "http-errors";
import { ApiError } from "../errors";

export const errorMiddleware: ErrorRequestHandler = (error, _, res, __) => {
  if (error instanceof HttpError)
    return res.status(error.status).json({ message: error.message });

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  console.error("Unexpected error:", error);
  return res.status(500).json({ message: "Internal server error" });
};
