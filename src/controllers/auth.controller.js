const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const authService = require("../services/auth.service");

/**
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, phone, password } = req.body;

  const result = await authService.registerCaretaker({ name, phone, password });

  return successResponse(res, 201, "Account created successfully.", result);
});

/**
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  const result = await authService.login({ phone, password });

  return successResponse(res, 200, "Login successful.", result);
});

/**
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);

  return successResponse(res, 200, "Profile retrieved successfully.", user);
});

module.exports = { register, login, getMe };