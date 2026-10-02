import { Router } from "express";
import { getUserNotifications } from "../controllers/notificationController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// Get notifications for logged in user
router.get("/:id/notifications", authenticate, getUserNotifications);

export default router;
