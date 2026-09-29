import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

// Get user profile
export const getUserProfile = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, email, role, display_picture
       FROM users
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Update user profile
export const updateUserProfile = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { name, email, display_picture } = req.body;

    // Check required fields
    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    // Check if user exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id],
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update user profile
    const updatedUser = await pool.query(
      `UPDATE users
       SET name = $1,
           email = $2,
           display_picture = $3
       WHERE id = $4
       RETURNING id, name, email, role, display_picture`,
      [name, email, display_picture, id],
    );

    return res.status(200).json({
      message: "User profile updated successfully",
      user: updatedUser.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Delete user profile
export const deleteUserProfile = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id],
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Delete user
    await pool.query(
      "DELETE FROM users WHERE id = $1",
      [id],
    );

    return res.status(200).json({
      message: "User profile deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};