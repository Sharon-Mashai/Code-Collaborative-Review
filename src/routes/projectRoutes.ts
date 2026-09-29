import { Router } from "express";
import { createProject, getProjects, assignMember, removeMember,} from "../controllers/projectController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Create project
router.post("/", authenticate, createProject);

// Get all projects
router.get("/", authenticate, getProjects);

// Assign member to project
router.post("/:id/members", authenticate, authorize("reviewer"), assignMember);

// Remove member from project
router.delete( "/:id/members/:userId", authenticate, authorize("reviewer"), removeMember,);

export default router;
