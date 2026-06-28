const logger = require("../utils/logger");

/**
 * Global error handling middleware.
 * Must be registered as the last middleware in app.js.
 *
 * Normalises errors from Mongoose, JWT, and custom throws into
 * a consistent JSON response shape.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose field validation errors (e.g. required field missing)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose duplicate key violation (e.g. phone number already registered)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists.`;
  }

  // Mongoose invalid ObjectId (e.g. malformed ID in URL params)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field '${err.path}'.`;
  }

  // JWT signature invalid
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  // JWT expired
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session has expired. Please log in again.";
  }

  // Log server errors — client errors (4xx) don't need full stack traces.
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message}`, { stack: err.stack });
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace in development only — never expose it in production.
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;