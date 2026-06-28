const { createLogger, format, transports } = require("winston");
const path = require("path");

const { combine, timestamp, errors, json, colorize, simple } = format;

// In production, log as structured JSON — easy to parse by log aggregators.
// In development, log in a human-readable coloured format.
const isProduction = process.env.NODE_ENV === "production";

const logger = createLogger({
  level: isProduction ? "warn" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    json()
  ),
  transports: [
    new transports.Console({
      format: isProduction ? json() : combine(colorize(), simple()),
    }),
    new transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),
    new transports.File({
      filename: path.join("logs", "combined.log"),
    }),
  ],
});

module.exports = logger;