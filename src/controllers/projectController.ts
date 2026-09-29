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

// Assign member to project
export const assignMember = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    // Check required field
    if (!user_id) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    // Check if project exists
    const project = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [id],
    );

    if (project.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check if user exists
    const user = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [user_id],
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if user is already assigned
    const existingMember = await pool.query(
      `SELECT *
       FROM project_members
       WHERE project_id = $1 AND user_id = $2`,
      [id, user_id],
    );

    if (existingMember.rows.length > 0) {
      return res.status(409).json({
        message: "User is already assigned to this project",
      });
    }

    // Assign user to project
    const newMember = await pool.query(
      `INSERT INTO project_members (project_id, user_id)
       VALUES ($1, $2)
       RETURNING id, project_id, user_id`,
      [id, user_id],
    );

    return res.status(201).json({
      message: "Member assigned to project successfully",
      member: newMember.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Remove member from project
export const removeMember = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id, userId } = req.params;

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

    // Check if member is assigned to the project
    const existingMember = await pool.query(
      `SELECT *
       FROM project_members
       WHERE project_id = $1 AND user_id = $2`,
      [id, userId],
    );

    if (existingMember.rows.length === 0) {
      return res.status(404).json({
        message: "Member is not assigned to this project",
      });
    }

    // Remove member from project
    await pool.query(
      `DELETE FROM project_members
       WHERE project_id = $1 AND user_id = $2`,
      [id, userId],
    );

    return res.status(200).json({
      message: "Member removed from project successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};