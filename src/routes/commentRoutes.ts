import { Router } from "express";
import { addComment } from "../controllers/commentController.js";
import { authenticate, authorize,} from "../middleware/authMiddleware.js";

const router = Router();

// Add comment to submission by Reviewer only
router.post( "/:id/comments", authenticate, authorize("reviewer"), addComment,);

export default router;