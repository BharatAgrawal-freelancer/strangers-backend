export const errorHandler = (err, req, res, next) => {
  console.error("[ERROR]", err.message)

  if (err.message.includes("Rate limit")) {
    return res.status(429).json({ error: err.message })
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "Validation failed", details: err.message })
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  })
}

export default errorHandler
