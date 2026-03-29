import express from "express";
import {
  getChat,
  sendMessage,
} from "../controllers/userChatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//  Get chat
router.get("/chat", protect, getChat);

//  Send message
router.post("/chat", protect, sendMessage);

export default router;