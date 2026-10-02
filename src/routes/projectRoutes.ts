import { Router } from "express";
import { createProject, getProjects, assignMember, removeMember, getProjectStats,} from "../controllers/projectController.js";
import { getSubmissionsByProject } from "../controllers/submissionController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validateId, validateRequiredFields,} from "../middleware/validationMiddleware.js";

const router = Router();

// Create project
router.post("/", authenticate, validateRequiredFields(["name"]), createProject);

// Get all projects
router.get("/", authenticate, getProjects);

// Get project statistics
router.get("/:id/stats", authenticate, validateId("id"), getProjectStats);

// Assign member to project
router.post( "/:id/members", authenticate, authorize("reviewer"), validateId("id"), validateRequiredFields(["user_id"]), assignMember,);

// Remove member from project
router.delete( "/:id/members/:userId", authenticate, authorize("reviewer"), validateId("id"), validateId("userId"), removeMember,);

// Get submissions by project
router.get( "/:id/submissions", authenticate, validateId("id"), getSubmissionsByProject,);

export default router;
