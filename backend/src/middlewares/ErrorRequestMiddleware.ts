import { ErrorRequestHandler } from "express";
import { ApiError } from "../errors";

export const errorMiddleware: ErrorRequestHandler = (error, _, res, __) => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  res.status(500).json({
    message: "Internal server error",
  });
};
