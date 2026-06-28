const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 7+ handles these defaults internally, but being explicit
      // makes the intent clear for anyone reading this config.
      autoIndex: process.env.NODE_ENV !== "production",
    });

    logger.info(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;