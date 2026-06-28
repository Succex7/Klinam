const rateLimit = require("express-rate-limit");

// Applied globally to all routes in app.js.
const generalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again in 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Applied only to authentication routes (register, login).
// Tighter limit to slow down brute force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter };