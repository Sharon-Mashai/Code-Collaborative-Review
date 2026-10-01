import { Router } from "express";
import { approveSubmission, requestChanges,} from "../controllers/reviewController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Approve submission - Reviewer only
router.post( "/:id/approve", authenticate, authorize("reviewer"), approveSubmission,);

// Request changes - Reviewer only
router.post( "/:id/request-changes", authenticate, authorize("reviewer"), requestChanges,);

export default router;
