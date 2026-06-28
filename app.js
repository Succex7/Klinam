const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

const routes = require("./src/routes/index");
const errorHandler = require("./src/middlewares/errorHandler.middleware");
const { generalLimiter } = require("./src/middlewares/rateLimiter.middleware");

const app = express();

// Set secure HTTP response headers.
app.use(helmet());

// Allow requests only from the configured client origins.
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Strip any keys containing '$' or '.' from req.body to block NoSQL injection.
app.use(mongoSanitize());

// Parse incoming JSON — reject payloads larger than 10kb.
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Apply a general rate limit to all routes before they hit any handler.
app.use(generalLimiter);

// Mount all API routes under /api/v1.
app.use("/api/v1", routes);

// Health check — useful for uptime monitors and deployment platforms.
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", environment: process.env.NODE_ENV });
});

// Catch any request that didn't match a defined route.
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler — must be the last middleware registered.
app.use(errorHandler);

module.exports = app;