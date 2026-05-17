import { ErrorRequestHandler } from "express";
import { ApiError } from "../../errors/lobby/apiError";

export const errorMiddleware: ErrorRequestHandler = (error, _, res, __) => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    message: "Internal server error"
  });
};
