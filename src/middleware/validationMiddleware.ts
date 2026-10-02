import type { Request, Response, NextFunction } from "express";

// Check that required body fields were provided
export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = fields.filter((field) => {
      const value = req.body[field];

      return (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      );
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    next();
  };
};

// Validate email format
export const validateEmail = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;

  // Required-field middleware handles missing email
  if (email === undefined) {
    return next();
  }

  if (typeof email !== "string") {
    return res.status(400).json({
      message: "Email must be a string",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  next();
};

// Validate user role
export const validateRole = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { role } = req.body;

  // Required-field middleware handles missing role
  if (role === undefined) {
    return next();
  }

  const allowedRoles = ["submitter", "reviewer"];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      message: "Role must be either submitter or reviewer",
    });
  }

  next();
};

// Validate positive numeric ID
export const validateId = (parameterName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[parameterName];
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: `Invalid ${parameterName}`,
      });
    }

    next();
  };
};
