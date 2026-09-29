import { Router } from "express";
import { createSubmission } from "../controllers/submissionController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// Create submission
router.post("/", authenticate, createSubmission);

export default router;