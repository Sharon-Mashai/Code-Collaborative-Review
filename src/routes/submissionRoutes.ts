import { Router } from "express";
import { createSubmission, getSubmissionById,} from "../controllers/submissionController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Create submission - Submitter only
router.post("/", authenticate, authorize("submitter"), createSubmission);

// Get single submission
router.get("/:id", authenticate, getSubmissionById);

export default router;
