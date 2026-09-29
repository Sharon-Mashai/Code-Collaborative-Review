import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

// Create project
export const createProject = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { name } = req.body;

    // Check required field
    if (!name) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    // Get logged-in user ID from JWT
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Create project
    const newProject = await pool.query(
      `INSERT INTO projects (name, created_by)
       VALUES ($1, $2)
       RETURNING id, name, created_by`,
      [name, userId],
    );

    return res.status(201).json({
      message: "Project created successfully",
      project: newProject.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get all projects
export const getProjects = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const result = await pool.query(
      `SELECT id, name, created_by
       FROM projects
       ORDER BY id ASC`,
    );

    return res.status(200).json({
      projects: result.rows,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};