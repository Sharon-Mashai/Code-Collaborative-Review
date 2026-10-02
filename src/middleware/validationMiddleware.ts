import type { Request, Response, NextFunction } from "express";

// Check required body fields
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

// Validate email
export const validateEmail = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;

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

// Validate submission status
export const validateSubmissionStatus = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { status } = req.body;

  if (status === undefined) {
    return next();
  }

  const allowedStatuses = [
    "pending",
    "in_review",
    "approved",
    "changes_requested",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message:
        "Status must be pending, in_review, approved or changes_requested",
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
