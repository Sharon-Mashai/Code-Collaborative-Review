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
        project_id,
        submitted_by,
        code
      )
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

// Get submissions by project
export const getSubmissionsByProject = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const project = await pool.query(
      "SELECT id FROM projects WHERE id = $1",
      [id],
    );

    if (project.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Get submissions for the project
    const submissions = await pool.query(
      `SELECT id, project_id, submitted_by, code, status
       FROM submissions
       WHERE project_id = $1
       ORDER BY id ASC`,
      [id],
    );

    return res.status(200).json({
      submissions: submissions.rows,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get single submission
export const getSubmissionById = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, project_id, submitted_by, code, status
       FROM submissions
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    return res.status(200).json({
      submission: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Update submission status
export const updateSubmissionStatus = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check required field
    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    // Allowed submission statuses
    const allowedStatuses = [
      "pending",
      "in_review",
      "approved",
      "changes_requested",
    ];

    // Check if status is valid
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Status must be pending, in_review, approved or changes_requested",
      });
    }

    // Check if submission exists
    const existingSubmission = await pool.query(
      "SELECT id FROM submissions WHERE id = $1",
      [id],
    );

    if (existingSubmission.rows.length === 0) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    // Update submission status
    const updatedSubmission = await pool.query(
      `UPDATE submissions
       SET status = $1
       WHERE id = $2
       RETURNING id, project_id, submitted_by, code, status`,
      [status, id],
    );

    return res.status(200).json({
      message: "Submission status updated successfully",
      submission: updatedSubmission.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};