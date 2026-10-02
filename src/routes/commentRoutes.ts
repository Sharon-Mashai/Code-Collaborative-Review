import { Router } from "express";
import { addComment, getCommentsBySubmission, updateComment, deleteComment,} from "../controllers/commentController.js";
import { authenticate, authorize,} from "../middleware/authMiddleware.js";
import { validateId, validateRequiredFields,} from "../middleware/validationMiddleware.js";

const router = Router();

// Add comment to submission - Reviewer only
router.post( "/submissions/:id/comments", authenticate, authorize("reviewer"), validateId("id"), validateRequiredFields(["comment"]), addComment,);

// Get comments for submission
router.get( "/submissions/:id/comments", authenticate, validateId("id"), getCommentsBySubmission,);

// Update comment - Reviewer only
router.put( "/comments/:id", authenticate, authorize("reviewer"), validateId("id"), validateRequiredFields(["comment"]), updateComment,);

// Delete comment - Reviewer only
router.delete( "/comments/:id",authenticate, authorize("reviewer"),validateId("id"), deleteComment,);

export default router;