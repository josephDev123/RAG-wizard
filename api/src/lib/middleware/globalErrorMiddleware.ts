import { NextFunction, Request, Response } from "express";
import { GlobalErrorHandler } from "../util/globalErrorHandler";

export const GlobalErrorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof GlobalErrorHandler) {
    if (err.operational) {
      res.status(err.statusCode).json({
        name: err.name,
        message: err.message,
      });
      return;
    } else {
      res.status(err.statusCode).json({
        name: err.name,
        message: "Something went wrong",
      });
      return;
    }
  }

  if (err instanceof Error) {
    res.status(500).json({
      name: err.name,
      message: "Internal Server Error",
    });
    return;
  }

  res.status(500).json({
    name: "UnknownError",
    message: "Internal Server Error",
  });
  return;
};
