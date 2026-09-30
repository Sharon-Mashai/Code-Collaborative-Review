import { Router } from "express";
import { addComment, getCommentsBySubmission,} from "../controllers/commentController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Add comment to submission - Reviewer only
router.post("/:id/comments", authenticate, authorize("reviewer"), addComment);

// Get comments for submission
router.get("/:id/comments", authenticate, getCommentsBySubmission);

export default router;
