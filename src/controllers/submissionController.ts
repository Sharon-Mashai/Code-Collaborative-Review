import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

// Create submission
export const createSubmission = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { project_id, code } = req.body;

    // Check required fields
    if (!project_id || !code) {
      return res.status(400).json({
        message: "Project ID and code are required",
      });
    }

    // Get logged-in user ID from JWT
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check if project exists
    const project = await pool.query(
      "SELECT id FROM projects WHERE id = $1",
      [project_id],
    );

    if (project.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Create submission
    const newSubmission = await pool.query(
      `INSERT INTO submissions (
        project_id, submitted_by, code)
       VALUES ($1, $2, $3)
       RETURNING id, project_id, submitted_by, code, status`,
      [project_id, userId, code],
    );

    return res.status(201).json({
      message: "Submission created successfully",
      submission: newSubmission.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};