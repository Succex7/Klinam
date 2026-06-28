const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User.model");

/**
 * Protect middleware — verifies the JWT from the Authorization header
 * and attaches the authenticated user to req.user.
 *
 * Expected header format: Authorization: Bearer <token>
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  // jwt.verify throws if the token is invalid or expired — asyncHandler
  // will forward that error to the global error handler automatically.
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "The user belonging to this token no longer exists.",
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Your account has been deactivated. Contact support.",
    });
  }

  req.user = user;
  next();
});

module.exports = { protect };