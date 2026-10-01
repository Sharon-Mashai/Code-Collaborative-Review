import { Router } from "express";
import { approveSubmission, requestChanges, getSubmissionReviews,} from "../controllers/reviewController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Approve submission by Reviewer only
router.post( "/:id/approve", authenticate, authorize("reviewer"), approveSubmission,);

// Request changes by Reviewer only
router.post( "/:id/request-changes", authenticate, authorize("reviewer"), requestChanges,);

// Get review history
router.get("/:id/reviews", authenticate, getSubmissionReviews);

export default router;
