import { Router } from "express";
import {
  createSubmission,
  getSubmissionById,
  updateSubmissionStatus,
} from "../controllers/submissionController.js";
import {
  authenticate,
  authorize,
} from "../middleware/authMiddleware.js";

const router = Router();

// Create submission - Submitter only
router.post(
  "/",
  authenticate,
  authorize("submitter"),
  createSubmission,
);

// Get single submission
router.get(
  "/:id",
  authenticate,
  getSubmissionById,
);

// Update submission status by Reviewer only
router.patch(
  "/:id/status",
  authenticate,
  authorize("reviewer"),
  updateSubmissionStatus,
);

export default router;