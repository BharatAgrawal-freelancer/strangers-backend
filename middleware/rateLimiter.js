import rateLimit from "express-rate-limit"

export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  message: "Too many search requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})

export default searchLimiter
