import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

// Approve submission
export const approveSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user?.id;

    if (!reviewerId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check if submission exists
    const existingSubmission = await pool.query(
      `SELECT id
       FROM submissions
       WHERE id = $1`,
      [id],
    );

    if (existingSubmission.rows.length === 0) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    // Update submission status to approved
    const updatedSubmission = await pool.query(
      `UPDATE submissions
       SET status = $1
       WHERE id = $2
       RETURNING id, project_id, submitted_by, code, status`,
      ["approved", id],
    );

    // Save review history
    const review = await pool.query(
      `INSERT INTO reviews (
        submission_id,
        reviewer_id,
        action
      )
      VALUES ($1, $2, $3)
      RETURNING id, submission_id, reviewer_id, action, created_at`,
      [id, reviewerId, "approved"],
    );

    return res.status(200).json({
      message: "Submission approved successfully",
      submission: updatedSubmission.rows[0],
      review: review.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Request changes to submission
export const requestChanges = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user?.id;

    if (!reviewerId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check if submission exists
    const existingSubmission = await pool.query(
      `SELECT id
       FROM submissions
       WHERE id = $1`,
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
      ["changes_requested", id],
    );

    // Save review history
    const review = await pool.query(
      `INSERT INTO reviews (
        submission_id,
        reviewer_id,
        action
      )
      VALUES ($1, $2, $3)
      RETURNING id, submission_id, reviewer_id, action, created_at`,
      [id, reviewerId, "changes_requested"],
    );

    return res.status(200).json({
      message: "Changes requested successfully",
      submission: updatedSubmission.rows[0],
      review: review.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get review history for submission
export const getSubmissionReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if submission exists
    const existingSubmission = await pool.query(
      `SELECT id
       FROM submissions
       WHERE id = $1`,
      [id],
    );

    if (existingSubmission.rows.length === 0) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    // Get review history
    const reviews = await pool.query(
      `SELECT id, submission_id, reviewer_id, action, created_at
       FROM reviews
       WHERE submission_id = $1
       ORDER BY created_at ASC`,
      [id],
    );

    return res.status(200).json({
      reviews: reviews.rows,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
