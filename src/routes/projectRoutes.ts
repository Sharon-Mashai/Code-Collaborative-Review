import { Router } from "express";
import { createProject, getProjects,} from "../controllers/projectController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// Create project
router.post("/", authenticate, createProject);

// Get all projects
router.get("/", authenticate, getProjects);

export default router;
