import { Router } from "express";
import {createSubmission,getSubmissionById,updateSubmissionStatus,deleteSubmission,} from "../controllers/submissionController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validateId, validateRequiredFields, validateSubmissionStatus,} from "../middleware/validationMiddleware.js";

const router = Router();

// Create submission by Submitter only
router.post("/",authenticate,authorize("submitter"),validateRequiredFields(["project_id", "code"]),createSubmission,);

// Get single submission
router.get("/:id", authenticate, validateId("id"), getSubmissionById);

// Update submission status by Reviewer only
router.patch( "/:id/status", authenticate, authorize("reviewer"), validateId("id"), validateRequiredFields(["status"]), validateSubmissionStatus, updateSubmissionStatus,);

// Delete submission by Submitter only
router.delete( "/:id", authenticate, authorize("submitter"), validateId("id"), deleteSubmission,);

export default router;
