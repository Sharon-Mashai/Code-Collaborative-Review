import { Router } from "express";
import { createSubmission } from "../controllers/submissionController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Create submission - Submitter only
router.post("/", authenticate, authorize("submitter"), createSubmission);

export default router;
