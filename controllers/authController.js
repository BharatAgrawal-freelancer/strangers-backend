import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendOtpMail } from "../middleware/mailer.js";
import jwt from "jsonwebtoken";

/* ======================================================
   UTILS
====================================================== */

const normalizeEmail = (email) =>
  email.trim().toLowerCase();

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (userId) => {
  return jwt.sign(
    { userId },                 // payload
    process.env.JWT_SECRET,     // secret
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    res.json(req.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ======================================================
   SIGNUP
====================================================== */
export const signup = async (req, res) => {
  try {
    console.log(" SIGNUP API HIT");
    console.log("️ Request Body:", req.body);

    let { email } = req.body;

    //  BAD REQUEST: Email Missing
    if (!email) {
      console.log(" BAD REQUEST: Email is missing");

      return res.status(400).json({
        message: "Email required"
      });
    }

    email = normalizeEmail(email);
    console.log(" Normalized Email:", email);

    //  Check Existing User
    const existingUser = await User.findOne({ email });

    //  Generate OTP
    const otp = generateOtp();
    console.log(" Generated OTP:", otp);

    //  Remove Old OTPs
    await Otp.deleteMany({ email });

    //  Save OTP
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    console.log(" OTP Saved in DB");

    //  Send OTP Mail
    await sendOtpMail(email, otp);
    console.log(" OTP Mail Sent");

    //  BAD REQUEST: Email Already Registered
    if (existingUser) {
      console.log("️ User Already Exists:", existingUser.email);

      // Google Account Case
      if (existingUser.provider === "google" && !existingUser.password) {
        console.log(" Google user found, password not set");

        return res.json({
          message: "Account created using Google. Verify OTP to set password.",
          step: "VERIFY_OTP",
        });
      }

      console.log(" BAD REQUEST: Email already registered");

      return res.status(400).json({
        message: "Email already registered",
      });
    }

    //  Create New User
    await User.create({
      email,
      provider: "form",
      isverified: false,
    });

    console.log(" New User Created Successfully");

    return res.json({
      message: "OTP sent to email",
      step: "VERIFY_OTP",
    });

  } catch (err) {
    console.log(" SIGNUP ERROR:", err);

    return res.status(500).json({
      error: err.message
    });
  }
};

/* ======================================================
   VERIFY OTP
====================================================== */
export const verifyOtp = async (req, res) => {
  try {
    let { email, otp, password, mobile } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        message: "Email, OTP and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    email = email.trim().toLowerCase();

    const record = await Otp.findOne({ email, otp });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // password set
    const hash = await bcrypt.hash(password, 10);
    user.password = hash;

    if (mobile) {
      if (!/^[0-9]{10}$/.test(mobile)) {
        return res.status(400).json({
          message: "Invalid mobile number",
        });
      }

      user.mobile = mobile;
      user.isverified = true;
    }

    await user.save();

    await Otp.deleteMany({ email });

    // 🔥 ADD THIS (IMPORTANT)
    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Password set/updated successfully",
      token, // ✅ send token
      user: {
        id: user._id,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({
      error: err.message,
    });
  }
};

/* ======================================================
   LOGIN
====================================================== */
export const login = async (req, res) => {
  console.log("🔵 LOGIN CONTROLLER START");

  try {
    let { email, password } = req.body;
    console.log("📥 BODY:", req.body);

    if (!email || !password) {
      console.log("❌ Missing email/password");
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    email = normalizeEmail(email);
    console.log("📧 Normalized Email:", email);

    const user = await User.findOne({ email });
    console.log("👤 User Found:", user ? "YES" : "NO");

    if (!user) {
      console.log("❌ USER NOT FOUND");
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.password) {
      console.log("❌ PASSWORD NOT SET");
      return res.status(400).json({
        message: "Password not set for this account",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log("🔑 Password Match:", match);

    if (!match) {
      console.log("❌ PASSWORD WRONG");
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.log("🟢 BEFORE TOKEN");

    const token = generateToken(user._id);

    console.log("🟢 TOKEN GENERATED:", token ? "YES" : "NO");

    console.log("🟢 SENDING RESPONSE");

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });

  } catch (err) {
    console.log("🔥 LOGIN ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};