import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { validateRequiredFields, validateEmail, validateRole,} from "../middleware/validationMiddleware.js";

const router = Router();

// Register
router.post( "/register", validateRequiredFields(["name", "email", "password", "role"]), validateEmail, validateRole, register,);

// Login
router.post( "/login", validateRequiredFields(["email", "password"]), validateEmail, login,);

export default router;
