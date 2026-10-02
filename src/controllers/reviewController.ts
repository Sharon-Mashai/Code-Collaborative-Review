import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";
import { sendToUser } from "../websocket.js";

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

    // Check if submission exists and get its submitter
    const existingSubmission = await pool.query(
      `SELECT id, submitted_by
       FROM submissions
       WHERE id = $1`,
      [id],
    );

    if (existingSubmission.rows.length === 0) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    const submitterId = Number(existingSubmission.rows[0].submitted_by);

    // Update submission status
    const updatedSubmission = await pool.query(
      `UPDATE submissions
       SET status = $1
       WHERE id = $2
       RETURNING
         id,
         project_id,
         submitted_by,
         code,
         status`,
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
      RETURNING
        id,
        submission_id,
        reviewer_id,
        action,
        created_at`,
      [id, reviewerId, "approved"],
    );

    const notificationMessage = `Your submission ${id} has been approved`;

    // Save notification in PostgreSQL
    const notification = await pool.query(
      `INSERT INTO notifications (
        user_id,
        message
      )
      VALUES ($1, $2)
      RETURNING
        id,
        user_id,
        message,
        created_at`,
      [submitterId, notificationMessage],
    );

    // Send live notification if submitter is connected
    sendToUser(submitterId, {
      type: "submission_approved",
      notification: notification.rows[0],
    });

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

// Request changes
export const requestChanges = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user?.id;

    if (!reviewerId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check if submission exists and get its submitter
    const existingSubmission = await pool.query(
      `SELECT id, submitted_by
       FROM submissions
       WHERE id = $1`,
      [id],
    );

    if (existingSubmission.rows.length === 0) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    const submitterId = Number(existingSubmission.rows[0].submitted_by);

    // Update submission status
    const updatedSubmission = await pool.query(
      `UPDATE submissions
       SET status = $1
       WHERE id = $2
       RETURNING
         id,
         project_id,
         submitted_by,
         code,
         status`,
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
      RETURNING
        id,
        submission_id,
        reviewer_id,
        action,
        created_at`,
      [id, reviewerId, "changes_requested"],
    );

    const notificationMessage = `Changes have been requested for your submission ${id}`;

    // Save notification in PostgreSQL
    const notification = await pool.query(
      `INSERT INTO notifications (
        user_id,
        message
      )
      VALUES ($1, $2)
      RETURNING
        id,
        user_id,
        message,
        created_at`,
      [submitterId, notificationMessage],
    );

    // Send live notification if submitter is connected
    sendToUser(submitterId, {
      type: "changes_requested",
      notification: notification.rows[0],
    });

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
      `SELECT
        id,
        submission_id,
        reviewer_id,
        action,
        created_at
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
