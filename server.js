import express from "express";
import dotenv from "dotenv";
dotenv.config();
import session from "express-session"; // <-- changed here
import passport from "passport";

import connectDB from "./config/db.js";
import corsConfig from "./middleware/cors.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import "./config/passport.js";
import geminiRoute from "./routes/geminiRoute.js";
import feedRoutes from "./routes/feedRoutes.js";
import userProfileRoutes from "./routes/userProfileRoutes.js";
import onboardingRoutes from "./routes/onboardingRoutes.js";
import filterRoutes from "./routes/filterRoutes.js";
import userInteractionRoutes from "./routes/userInteractionRoutes.js";
import userChatRoutes from "./routes/userChatRoutes.js";

const app = express();
const PORT = process.env.PORT;
connectDB();

// Middleware
app.use(corsConfig);
app.use(express.json());


app.set("trust proxy", 1); 
app.use(
  session({
    name: "connect.sid", //  THIS IS REQUIRED
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());



app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});
app.use("/auth", authRoutes);
app.use("/api/gemini", geminiRoute);
app.use("/api", feedRoutes);
app.use("/api", userProfileRoutes);
app.use("/api", onboardingRoutes);
app.use("/api", filterRoutes);
app.use("/api", userInteractionRoutes);
app.use("/api", userChatRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Running on http://localhost:${PORT}`);
});
