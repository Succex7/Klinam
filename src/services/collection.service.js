const Property = require("../models/Property.model");
const CollectionRequest = require("../models/CollectionRequest.model");
const Subscription = require("../models/Subscription.model");
const { BIN_STATUS, COLLECTION_STATUS, SUBSCRIPTION_STATUS } = require("../utils/constants");

/**
 * Report a bin as full. Creates a CollectionRequest document and
 * updates the property's bin status to FILLED.
 *
 * Rules enforced:
 * - Property must belong to the requesting caretaker.
 * - Property must have an active subscription.
 * - Bin must currently be EMPTY — you cannot report a bin that is already FILLED.
 *
 * @param {string} propertyId - MongoDB ObjectId of the property
 * @param {string} caretakerId - The authenticated caretaker's user ID
 * @param {string|null} note - Optional note from the caretaker
 * @returns {object} The created CollectionRequest document
 */
const reportBinFull = async (propertyId, caretakerId, note = null) => {
  const property = await Property.findOne({
    _id: propertyId,
    owner: caretakerId,
    isActive: true,
  });

  if (!property) {
    const error = new Error("Property not found.");
    error.statusCode = 404;
    throw error;
  }

  if (property.binStatus === BIN_STATUS.FILLED) {
    const error = new Error(
      "This bin has already been reported as full. Awaiting collection."
    );
    error.statusCode = 400;
    throw error;
  }

  // Only allow reporting if the property has an active subscription.
  const subscription = await Subscription.findOne({
    property: propertyId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
  });

  if (!subscription) {
    const error = new Error(
      "This property does not have an active subscription. Please activate your service before reporting."
    );
    error.statusCode = 403;
    throw error;
  }

  const now = new Date();

  // Update the property status and timestamp atomically.
  property.binStatus = BIN_STATUS.FILLED;
  property.lastReportedFullAt = now;
  await property.save();

  const collectionRequest = await CollectionRequest.create({
    property: propertyId,
    reportedBy: caretakerId,
    status: COLLECTION_STATUS.PENDING,
    reportedAt: now,
    caretakerNote: note,
  });

  return collectionRequest;
};

/**
 * Mark a bin as emptied after the truck has visited. Only admins can do this.
 * Updates both the CollectionRequest and the Property document.
 *
 * @param {string} collectionRequestId - MongoDB ObjectId of the collection request
 * @param {string} adminId - The authenticated admin's user ID
 * @param {string|null} note - Optional admin note
 * @returns {object} The updated CollectionRequest document
 */
const markBinEmptied = async (collectionRequestId, adminId, note = null) => {
  const collectionRequest = await CollectionRequest.findById(collectionRequestId);

  if (!collectionRequest) {
    const error = new Error("Collection request not found.");
    error.statusCode = 404;
    throw error;
  }

  if (collectionRequest.status === COLLECTION_STATUS.COMPLETED) {
    const error = new Error("This collection request has already been resolved.");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();

  collectionRequest.status = COLLECTION_STATUS.COMPLETED;
  collectionRequest.resolvedBy = adminId;
  collectionRequest.resolvedAt = now;
  collectionRequest.adminNote = note;
  await collectionRequest.save();

  // Sync the property's bin status back to EMPTY.
  await Property.findByIdAndUpdate(collectionRequest.property, {
    binStatus: BIN_STATUS.EMPTY,
    lastEmptiedAt: now,
  });

  return collectionRequest;
};

/**
 * Get all collection requests for a specific property.
 * Used by caretakers to see the history of their property's collections.
 *
 * @param {string} propertyId - MongoDB ObjectId of the property
 * @param {string} ownerId - The caretaker's user ID (for ownership check)
 * @returns {object[]} Array of CollectionRequest documents
 */
const getCollectionHistoryForProperty = async (propertyId, ownerId) => {
  const property = await Property.findOne({
    _id: propertyId,
    owner: ownerId,
    isActive: true,
  });

  if (!property) {
    const error = new Error("Property not found.");
    error.statusCode = 404;
    throw error;
  }

  const history = await CollectionRequest.find({ property: propertyId })
    .populate("reportedBy", "name phone")
    .populate("resolvedBy", "name")
    .sort({ reportedAt: -1 });

  return history;
};

/**
 * Get all pending collection requests across all properties.
 * Admin-only — used to prioritise which properties need a truck dispatched.
 *
 * @returns {object[]} Array of pending CollectionRequest documents
 */
const getAllPendingRequests = async () => {
  const pending = await CollectionRequest.find({
    status: COLLECTION_STATUS.PENDING,
  })
    .populate({
      path: "property",
      select: "name locationDescription binStatus lastReportedFullAt",
      populate: { path: "owner", select: "name phone" },
    })
    .sort({ reportedAt: 1 }); // Oldest reports first — highest priority

  return pending;
};

module.exports = {
  reportBinFull,
  markBinEmptied,
  getCollectionHistoryForProperty,
  getAllPendingRequests,
};