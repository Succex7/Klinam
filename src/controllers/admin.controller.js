const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const Property = require("../models/Property.model");
const User = require("../models/User.model");
const CollectionRequest = require("../models/CollectionRequest.model");
const paymentService = require("../services/payment.service");
const { BIN_STATUS, COLLECTION_STATUS, SUBSCRIPTION_STATUS } = require("../utils/constants");

/**
 * @route   GET /api/v1/admin/properties
 * @access  Private (admin)
 *
 * Returns all active properties across all caretakers.
 * Filled bins are sorted to the top — matching the admin dashboard priority view.
 */
const getAllProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ isActive: true })
    .populate("owner", "name phone")
    .sort({ binStatus: -1, lastReportedFullAt: 1 });
  // binStatus: -1 sorts "filled" before "empty" alphabetically descending.
  // lastReportedFullAt: 1 puts the oldest reports first within the filled group.

  return successResponse(res, 200, "All properties retrieved.", properties);
});

/**
 * @route   GET /api/v1/admin/users
 * @access  Private (admin)
 *
 * Returns all registered caretaker accounts.
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "caretaker" }).sort({ createdAt: -1 });

  return successResponse(res, 200, "All users retrieved.", users);
});

/**
 * @route   GET /api/v1/admin/dashboard
 * @access  Private (admin)
 *
 * Returns aggregated stats for the admin dashboard overview.
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalProperties,
    filledBins,
    pendingCollections,
    totalCaretakers,
    subscriptionSummary,
  ] = await Promise.all([
    Property.countDocuments({ isActive: true }),
    Property.countDocuments({ isActive: true, binStatus: BIN_STATUS.FILLED }),
    CollectionRequest.countDocuments({ status: COLLECTION_STATUS.PENDING }),
    User.countDocuments({ role: "caretaker", isActive: true }),
    paymentService.getSubscriptionSummary(),
  ]);

  const stats = {
    totalProperties,
    filledBins,
    emptyBins: totalProperties - filledBins,
    pendingCollections,
    totalCaretakers,
    subscriptions: {
      active: subscriptionSummary[SUBSCRIPTION_STATUS.ACTIVE] || 0,
      inactive: subscriptionSummary[SUBSCRIPTION_STATUS.INACTIVE] || 0,
      failed: subscriptionSummary[SUBSCRIPTION_STATUS.FAILED] || 0,
    },
  };

  return successResponse(res, 200, "Dashboard stats retrieved.", stats);
});

/**
 * @route   PATCH /api/v1/admin/users/:id/deactivate
 * @access  Private (admin)
 *
 * Soft-deactivates a caretaker account without deleting any data.
 */
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  if (user.role === "admin") {
    const error = new Error("Admin accounts cannot be deactivated through this route.");
    error.statusCode = 403;
    throw error;
  }

  user.isActive = false;
  await user.save();

  return successResponse(res, 200, "User account deactivated successfully.", null);
});

module.exports = {
  getAllProperties,
  getAllUsers,
  getDashboardStats,
  deactivateUser,
};