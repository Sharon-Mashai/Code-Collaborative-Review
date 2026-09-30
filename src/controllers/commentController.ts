import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

// Add comment to submission
export const addComment = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    // Check required field
    if (!comment) {
      return res.status(400).json({
        message: "Comment is required",
      });
    }

    // Get logged-in reviewer ID from JWT
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check if submission exists
    const submission = await pool.query(
      "SELECT id FROM submissions WHERE id = $1",
      [id],
    );

    if (submission.rows.length === 0) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    // Create comment
    const newComment = await pool.query(
      `INSERT INTO comments (
        submission_id,
        user_id,
        comment
      )
      VALUES ($1, $2, $3)
      RETURNING id, submission_id, user_id, comment`,
      [id, userId, comment],
    );

    return res.status(201).json({
      message: "Comment added successfully",
      comment: newComment.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get comments for submission
export const getCommentsBySubmission = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;

    // Check if submission exists
    const submission = await pool.query(
      "SELECT id FROM submissions WHERE id = $1",
      [id],
    );

    if (submission.rows.length === 0) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    // Get comments for submission
    const comments = await pool.query(
      `SELECT id, submission_id, user_id, comment
       FROM comments
       WHERE submission_id = $1
       ORDER BY id ASC`,
      [id],
    );

    return res.status(200).json({
      comments: comments.rows,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};