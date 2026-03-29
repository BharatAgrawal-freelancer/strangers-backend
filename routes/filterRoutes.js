import express from "express";
import { filterUsers } from "../controllers/filterController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//  Protected filter route
router.get("/filter", protect, filterUsers);

export default router;