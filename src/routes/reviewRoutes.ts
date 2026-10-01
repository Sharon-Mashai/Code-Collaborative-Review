import { Router } from "express";
import { approveSubmission } from "../controllers/reviewController.js";
import { authenticate, authorize,} from "../middleware/authMiddleware.js";

const router = Router();

// Approve submission - Reviewer only
router.post( "/:id/approve", authenticate,authorize("reviewer"),approveSubmission,);

export default router;