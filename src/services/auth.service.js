const User = require("../models/User.model");
const generateToken = require("../utils/generateToken");
const ROLES = require("../config/roles");

/**
 * Register a new caretaker account.
 * Passwords are hashed inside the User model's pre-save hook,
 * so we pass the plain-text password directly.
 *
 * @param {object} data - { name, phone, password }
 * @returns {object} - { user, token }
 */
const registerCaretaker = async (data) => {
  const { name, phone, password } = data;

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    const error = new Error("An account with this phone number already exists.");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    phone,
    password,
    role: ROLES.CARETAKER,
  });

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
    token,
  };
};

/**
 * Authenticate a user by phone and password.
 * Works for both caretakers and admins — role is checked at the route level.
 *
 * @param {object} data - { phone, password }
 * @returns {object} - { user, token }
 */
const login = async (data) => {
  const { phone, password } = data;

  // Explicitly select password since it has select: false on the model.
  const user = await User.findOne({ phone }).select("+password");

  if (!user) {
    const error = new Error("Invalid phone number or password.");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Your account has been deactivated. Contact support.");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    const error = new Error("Invalid phone number or password.");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
    token,
  };
};

/**
 * Return the authenticated user's profile.
 * req.user is already attached by the protect middleware.
 *
 * @param {string} userId - MongoDB ObjectId of the authenticated user
 * @returns {object} user
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = { registerCaretaker, login, getProfile };