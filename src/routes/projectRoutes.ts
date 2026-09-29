import { Router } from "express";
import { createProject, getProjects, assignMember, removeMember,} from "../controllers/projectController.js";
import { getSubmissionsByProject } from "../controllers/submissionController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Create project
router.post("/", authenticate, createProject);

// Get all projects
router.get("/", authenticate, getProjects);

// Assign member to project
router.post("/:id/members", authenticate, authorize("reviewer"), assignMember);

// Remove member from project
router.delete("/:id/members/:userId", authenticate, authorize("reviewer"),removeMember,);

// Get submissions by project
router.get("/:id/submissions", authenticate, getSubmissionsByProject);

export default router;
