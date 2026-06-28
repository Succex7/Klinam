const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const propertyService = require("../services/property.service");

/**
 * @route   POST /api/v1/properties
 * @access  Private (caretaker)
 */
const createProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.createProperty(req.user._id, req.body);

  return successResponse(res, 201, "Property registered successfully.", property);
});

/**
 * @route   GET /api/v1/properties
 * @access  Private (caretaker)
 */
const getMyProperties = asyncHandler(async (req, res) => {
  const properties = await propertyService.getMyProperties(req.user._id);

  return successResponse(res, 200, "Properties retrieved successfully.", properties);
});

/**
 * @route   GET /api/v1/properties/:id
 * @access  Private (caretaker — own properties only | admin — any)
 */
const getPropertyById = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyById(
    req.params.id,
    req.user._id,
    req.user.role
  );

  return successResponse(res, 200, "Property retrieved successfully.", property);
});

/**
 * @route   PATCH /api/v1/properties/:id
 * @access  Private (caretaker — own properties only)
 */
const updateProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.updateProperty(
    req.params.id,
    req.user._id,
    req.body
  );

  return successResponse(res, 200, "Property updated successfully.", property);
});

/**
 * @route   DELETE /api/v1/properties/:id
 * @access  Private (caretaker — own properties only)
 */
const deleteProperty = asyncHandler(async (req, res) => {
  await propertyService.deleteProperty(req.params.id, req.user._id);

  return successResponse(res, 200, "Property removed successfully.", null);
});

module.exports = {
  createProperty,
  getMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};