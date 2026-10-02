import type { Request, Response, NextFunction } from "express";

// Custom application error
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);

    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

// Handle routes that do not exist
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(
    404,
    `Route not found: ${req.method} ${req.originalUrl}`,
  );

  next(error);
};

// Global error handler
export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
};
