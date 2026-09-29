import { Router } from "express";
import { createProject } from "../controllers/projectController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// Create project
router.post("/", authenticate, createProject);

export default router;