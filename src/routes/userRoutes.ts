import { Router } from "express";
import { getUserProfile, updateUserProfile,} from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// Get user profile
router.get("/:id", authenticate, getUserProfile);

// Update user profile
router.put("/:id", authenticate, updateUserProfile);

export default router;
