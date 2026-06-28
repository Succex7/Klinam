const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT for a given user ID.
 * The secret and expiry are read from environment variables.
 *
 * @param {string} userId - The MongoDB ObjectId of the user
 * @returns {string} A signed JWT string
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

module.exports = generateToken;