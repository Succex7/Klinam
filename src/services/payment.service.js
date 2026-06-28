const Payment = require("../models/Payment.model");
const Subscription = require("../models/Subscription.model");
const Property = require("../models/Property.model");
const { SUBSCRIPTION_STATUS } = require("../utils/constants");

/**
 * Fetch the subscription status for a specific property.
 * Caretakers use this to know if their service is active.
 *
 * @param {string} propertyId - MongoDB ObjectId of the property
 * @param {string} ownerId - The caretaker's user ID
 * @returns {object|null} The subscription document or null if none exists
 */
const getSubscriptionStatus = async (propertyId, ownerId) => {
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

  const subscription = await Subscription.findOne({ property: propertyId });

  return subscription;
};

/**
 * Fetch the full payment history for a specific property.
 * Returns payments sorted from most recent to oldest.
 *
 * @param {string} propertyId - MongoDB ObjectId of the property
 * @param {string} ownerId - The caretaker's user ID
 * @returns {object[]} Array of Payment documents
 */
const getPaymentHistoryForProperty = async (propertyId, ownerId) => {
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

  const payments = await Payment.find({ property: propertyId }).sort({
    createdAt: -1,
  });

  return payments;
};

/**
 * Create a new subscription record for a property after the caretaker
 * links their OPay account. The subscription starts as INACTIVE and is
 * activated once OPay confirms the first successful payment via webhook.
 *
 * @param {string} propertyId - MongoDB ObjectId of the property
 * @param {string} ownerId - The caretaker's user ID
 * @param {string} opayMandateId - The mandate reference from OPay
 * @param {string} opayCustomerReference - The OPay account reference
 * @param {number} amountKobo - Monthly subscription amount in kobo
 * @returns {object} The created Subscription document
 */
const createSubscription = async (
  propertyId,
  ownerId,
  opayMandateId,
  opayCustomerReference,
  amountKobo
) => {
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

  const existingSubscription = await Subscription.findOne({
    property: propertyId,
  });

  if (existingSubscription) {
    const error = new Error(
      "This property already has a subscription. Manage it from your dashboard."
    );
    error.statusCode = 409;
    throw error;
  }

  const subscription = await Subscription.create({
    property: propertyId,
    owner: ownerId,
    opayMandateId,
    opayCustomerReference,
    amountKobo,
    status: SUBSCRIPTION_STATUS.INACTIVE,
  });

  return subscription;
};

/**
 * Get a summary of all subscriptions across all properties.
 * Admin-only — used to monitor active vs inactive accounts.
 *
 * @returns {object} Counts grouped by subscription status
 */
const getSubscriptionSummary = async () => {
  const summary = await Subscription.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Reshape array into a flat object: { active: 5, inactive: 2, failed: 1 }
  const result = summary.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return result;
};

module.exports = {
  getSubscriptionStatus,
  getPaymentHistoryForProperty,
  createSubscription,
  getSubscriptionSummary,
};