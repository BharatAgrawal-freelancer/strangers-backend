import express from "express";
import { getRandomUsers } from "../controllers/feedController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

// GET /api/feed
router.get("/feed", protect , getRandomUsers);

export default router;