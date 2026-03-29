import express from "express";
import { likeUser } from "../controllers/userInteractionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/likeUser", protect, likeUser);

export default router;