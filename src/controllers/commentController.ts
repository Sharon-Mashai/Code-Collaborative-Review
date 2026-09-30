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

// Update comment
export const updateComment = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user?.id;

    // Check required field
    if (!comment) {
      return res.status(400).json({
        message: "Comment is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check if comment exists
    const existingComment = await pool.query(
      `SELECT id, user_id
       FROM comments
       WHERE id = $1`,
      [id],
    );

    if (existingComment.rows.length === 0) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Reviewer can only update their own comment
    if (existingComment.rows[0].user_id !== userId) {
      return res.status(403).json({
        message: "You are not authorized to update this comment",
      });
    }

    // Update comment
    const updatedComment = await pool.query(
      `UPDATE comments
       SET comment = $1
       WHERE id = $2
       RETURNING id, submission_id, user_id, comment`,
      [comment, id],
    );

    return res.status(200).json({
      message: "Comment updated successfully",
      comment: updatedComment.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Delete comment
export const deleteComment = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check if comment exists
    const existingComment = await pool.query(
      `SELECT id, user_id
       FROM comments
       WHERE id = $1`,
      [id],
    );

    if (existingComment.rows.length === 0) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Reviewer can only delete their own comment
    if (existingComment.rows[0].user_id !== userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this comment",
      });
    }

    // Delete comment
    await pool.query(
      "DELETE FROM comments WHERE id = $1",
      [id],
    );

    return res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};