const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const collectionService = require("../services/collection.service");
const notificationService = require("../services/notification.service");
const Property = require("../models/Property.model");
const User = require("../models/User.model");

/**
 * @route   POST /api/v1/collections/report/:propertyId
 * @access  Private (caretaker)
 */
const reportBinFull = asyncHandler(async (req, res) => {
  const { note } = req.body;

  const collectionRequest = await collectionService.reportBinFull(
    req.params.propertyId,
    req.user._id,
    note || null
  );

  // Fire notification in the background — do not await so it doesn't
  // block or delay the response back to the caretaker.
  const property = await Property.findById(req.params.propertyId);
  notificationService
    .notifyAdminBinReported(property, req.user)
    .catch(() => {}); // Swallow notification errors — they should never affect core flow

  return successResponse(
    res,
    201,
    "Bin reported as full. The operations team has been notified.",
    collectionRequest
  );
});

/**
 * @route   PATCH /api/v1/collections/:id/resolve
 * @access  Private (admin)
 */
const markBinEmptied = asyncHandler(async (req, res) => {
  const { note } = req.body;

  const collectionRequest = await collectionService.markBinEmptied(
    req.params.id,
    req.user._id,
    note || null
  );

  // Notify the caretaker in the background.
  const property = await Property.findById(collectionRequest.property);
  const caretaker = await User.findById(property.owner);
  notificationService
    .notifyCaretakerBinEmptied(property, caretaker)
    .catch(() => {});

  return successResponse(
    res,
    200,
    "Bin marked as emptied. Caretaker has been notified.",
    collectionRequest
  );
});

/**
 * @route   GET /api/v1/collections/history/:propertyId
 * @access  Private (caretaker — own properties only)
 */
const getCollectionHistory = asyncHandler(async (req, res) => {
  const history = await collectionService.getCollectionHistoryForProperty(
    req.params.propertyId,
    req.user._id
  );

  return successResponse(res, 200, "Collection history retrieved.", history);
});

/**
 * @route   GET /api/v1/collections/pending
 * @access  Private (admin)
 */
const getPendingRequests = asyncHandler(async (req, res) => {
  const pending = await collectionService.getAllPendingRequests();

  return successResponse(
    res,
    200,
    "Pending collection requests retrieved.",
    pending
  );
});

module.exports = {
  reportBinFull,
  markBinEmptied,
  getCollectionHistory,
  getPendingRequests,
};