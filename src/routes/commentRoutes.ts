import { Router } from "express";
import { addComment, getCommentsBySubmission, updateComment,} from "../controllers/commentController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Add comment to submission - Reviewer only
router.post( "/submissions/:id/comments", authenticate, authorize("reviewer"), addComment,);

// Get comments for submission
router.get("/submissions/:id/comments", authenticate, getCommentsBySubmission);

// Update comment - Reviewer only
router.put("/comments/:id", authenticate, authorize("reviewer"), updateComment);

export default router;
