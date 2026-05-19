import { ErrorRequestHandler } from "express";
import { ApiError } from "../../errors/apiError";

export const errorMiddleware: ErrorRequestHandler = (error, _, res, __) => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    message: "Internal server error"
  });
};
