import { Router } from "express";
import { getUserProfile, updateUserProfile, deleteUserProfile,} from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateId, validateRequiredFields, validateEmail,} from "../middleware/validationMiddleware.js";

const router = Router();

// Get user profile
router.get("/:id", authenticate, validateId("id"), getUserProfile);

// Update user profile
router.put( "/:id", authenticate, validateId("id"), validateRequiredFields(["name", "email"]), validateEmail, updateUserProfile);

// Delete user profile
router.delete("/:id", authenticate, validateId("id"), deleteUserProfile);

export default router;
