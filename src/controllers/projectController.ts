import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

// Create project
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.user?.id;

    if (!name) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const newProject = await pool.query(
      `INSERT INTO projects (
        name,
        created_by
      )
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
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await pool.query(
      `SELECT id, name, created_by
       FROM projects
       ORDER BY id ASC`,
    );

    return res.status(200).json({
      projects: projects.rows,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Assign member to project
export const assignMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    // Check if project exists
    const project = await pool.query("SELECT id FROM projects WHERE id = $1", [
      id,
    ]);

    if (project.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check if user exists
    const user = await pool.query("SELECT id FROM users WHERE id = $1", [
      user_id,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if member is already assigned
    const existingMember = await pool.query(
      `SELECT id
       FROM project_members
       WHERE project_id = $1 AND user_id = $2`,
      [id, user_id],
    );

    if (existingMember.rows.length > 0) {
      return res.status(409).json({
        message: "User is already assigned to this project",
      });
    }

    // Assign member
    const newMember = await pool.query(
      `INSERT INTO project_members (
        project_id,
        user_id
      )
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
export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id, userId } = req.params;

    // Check if project exists
    const project = await pool.query("SELECT id FROM projects WHERE id = $1", [
      id,
    ]);

    if (project.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check if member is assigned
    const existingMember = await pool.query(
      `SELECT id
       FROM project_members
       WHERE project_id = $1 AND user_id = $2`,
      [id, userId],
    );

    if (existingMember.rows.length === 0) {
      return res.status(404).json({
        message: "Project member not found",
      });
    }

    // Remove member
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

// Get project statistics
export const getProjectStats = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const projectResult = await pool.query(
      `SELECT id, name
       FROM projects
       WHERE id = $1`,
      [id],
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Count submissions by their current status
    const submissionStatsResult = await pool.query(
      `SELECT
        COUNT(*)::int AS total_submissions,

        COUNT(*) FILTER (
          WHERE status = 'pending'
        )::int AS pending,

        COUNT(*) FILTER (
          WHERE status = 'in_review'
        )::int AS in_review,

        COUNT(*) FILTER (
          WHERE status = 'approved'
        )::int AS approved,

        COUNT(*) FILTER (
          WHERE status = 'changes_requested'
        )::int AS changes_requested

       FROM submissions
       WHERE project_id = $1`,
      [id],
    );

    const stats = submissionStatsResult.rows[0];

    const total = Number(stats.total_submissions);
    const pending = Number(stats.pending);
    const inReview = Number(stats.in_review);
    const approved = Number(stats.approved);
    const changesRequested = Number(stats.changes_requested);

    // Helper function for percentages
    const calculatePercentage = (count: number): number => {
      if (total === 0) {
        return 0;
      }

      return Number(((count / total) * 100).toFixed(2));
    };

    const pendingPercentage = calculatePercentage(pending);

    const inReviewPercentage = calculatePercentage(inReview);

    const approvedPercentage = calculatePercentage(approved);

    const changesRequestedPercentage = calculatePercentage(changesRequested);

    /*
     * Calculate average review time using the FIRST
     * review action for each submission.
     *
     * Old submissions whose review happened before
     * submissions.created_at are excluded because
     * created_at was added later during development.
     */
    const averageReviewTimeResult = await pool.query(
      `SELECT
        AVG(
          EXTRACT(
            EPOCH FROM (
              first_review.first_review_at - s.created_at
            )
          )
        ) AS average_seconds

       FROM submissions s

       JOIN (
         SELECT
           submission_id,
           MIN(created_at) AS first_review_at
         FROM reviews
         GROUP BY submission_id
       ) first_review
         ON first_review.submission_id = s.id

       WHERE s.project_id = $1
       AND first_review.first_review_at >= s.created_at`,
      [id],
    );

    const averageSeconds = averageReviewTimeResult.rows[0].average_seconds;

    const averageReviewTimeMinutes =
      averageSeconds === null
        ? null
        : Number((Number(averageSeconds) / 60).toFixed(2));

    // Count every review action performed by each reviewer
    const reviewerActivityResult = await pool.query(
      `SELECT
        r.reviewer_id,
        u.name AS reviewer_name,
        COUNT(r.id)::int AS review_count

       FROM reviews r

       JOIN submissions s
         ON s.id = r.submission_id

       JOIN users u
         ON u.id = r.reviewer_id

       WHERE s.project_id = $1

       GROUP BY
         r.reviewer_id,
         u.name

       ORDER BY
         review_count DESC,
         r.reviewer_id ASC`,
      [id],
    );

    /*
     * Find the submission with the highest number
     * of comments.
     */
    const mostCommentedResult = await pool.query(
      `SELECT
        s.id AS submission_id,
        COUNT(c.id)::int AS comment_count

       FROM submissions s

       LEFT JOIN comments c
         ON c.submission_id = s.id

       WHERE s.project_id = $1

       GROUP BY s.id

       ORDER BY
         comment_count DESC,
         s.id ASC

       LIMIT 1`,
      [id],
    );

    let mostCommentedSubmission = null;

    if (
      mostCommentedResult.rows.length > 0 &&
      Number(mostCommentedResult.rows[0].comment_count) > 0
    ) {
      mostCommentedSubmission = {
        submission_id: Number(mostCommentedResult.rows[0].submission_id),
        comment_count: Number(mostCommentedResult.rows[0].comment_count),
      };
    }

    return res.status(200).json({
      project: {
        id: projectResult.rows[0].id,
        name: projectResult.rows[0].name,
      },

      submissions: {
        total,
        pending,
        in_review: inReview,
        approved,
        changes_requested: changesRequested,
      },

      percentages: {
        pending: pendingPercentage,
        in_review: inReviewPercentage,
        approved: approvedPercentage,
        changes_requested: changesRequestedPercentage,
      },

      average_review_time_minutes: averageReviewTimeMinutes,

      reviewer_activity: reviewerActivityResult.rows.map((reviewer) => ({
        reviewer_id: Number(reviewer.reviewer_id),
        reviewer_name: reviewer.reviewer_name,
        review_count: Number(reviewer.review_count),
      })),

      most_commented_submission: mostCommentedSubmission,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
