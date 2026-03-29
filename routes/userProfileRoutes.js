import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  replaceUserProfile
} from "../controllers/userProfileController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Protected routes
router.get("/profile", protect, getUserProfile);

//  ADD multer here
router.patch(
  "/profile",
  protect,
  upload.single("profilePicture"), // IMPORTANT
  updateUserProfile
);

router.put("/profile", protect, replaceUserProfile);

export default router;