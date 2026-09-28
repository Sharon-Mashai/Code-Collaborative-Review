import { Router } from "express";
import { getUserProfile } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// Get user profile
router.get("/:id", authenticate, getUserProfile);

export default router;