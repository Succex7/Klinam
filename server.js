require("dotenv").config();

const validateEnv = require("./src/config/env");
const connectDB = require("./src/config/db");
const logger = require("./src/utils/logger");
const app = require("./app");

// Validate all required environment variables before doing anything else.
// This crashes immediately if something is missing — better than a cryptic
// failure deep inside a payment flow.
validateEnv();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`Klinam server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
};

// Log unhandled rejections and exit. Letting a broken process keep running
// is worse than a clean crash.
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

startServer();