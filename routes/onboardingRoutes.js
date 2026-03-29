import express from "express";
import { onboarding } from "../controllers/onboardingController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

//  Protected + file upload
router.post(
  "/onboarding",
  protect,
  upload.single("profilePicture"), // field name from frontend
  onboarding
);

export default router;