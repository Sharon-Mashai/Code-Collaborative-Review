import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

// Get notifications for a user
export const getUserNotifications = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.user?.id;

    if (!loggedInUserId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Users can only view their own notifications
    if (Number(id) !== loggedInUserId) {
      return res.status(403).json({
        message: "You are not authorized to view these notifications",
      });
    }

    // Check if user exists
    const existingUser = await pool.query(
      `SELECT id
       FROM users
       WHERE id = $1`,
      [id],
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Get user's notifications
    const notifications = await pool.query(
      `SELECT id, user_id, message, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [id],
    );

    return res.status(200).json({
      notifications: notifications.rows,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};