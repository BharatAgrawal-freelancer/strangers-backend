import express from "express";
import passport from "passport";

import {
  signup,
  verifyOtp,
  login,
  getMe,          //  added
} from "../controllers/authController.js";

const router = express.Router();



router.post("/login", (req, res, next) => {
  console.log("LOGIN ROUTE HIT"); // 👈 IMPORTANT
  next();
}, login);
router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);


/* ======================================================
   SESSION USER
====================================================== */

router.get("/me", getMe);   //  GET CURRENT LOGGED-IN USER

/* ======================================================
   GOOGLE AUTH ROUTES
====================================================== */

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    res.redirect("http://localhost:5173/auth/success");
  }
);

/* ======================================================
   LOGOUT
====================================================== */

router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
});

export default router;
