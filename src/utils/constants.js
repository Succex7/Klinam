// Shared enum-style constants used across models, services, and controllers.
// Using Object.freeze() prevents accidental mutation at runtime.

const BIN_STATUS = Object.freeze({
  EMPTY: "empty",
  FILLED: "filled",
});

const SUBSCRIPTION_STATUS = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
  FAILED: "failed",
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
});

const COLLECTION_STATUS = Object.freeze({
  PENDING: "pending",   // Bin reported full, not yet collected
  COMPLETED: "completed", // Truck has visited and admin marked it emptied
});

module.exports = {
  BIN_STATUS,
  SUBSCRIPTION_STATUS,
  PAYMENT_STATUS,
  COLLECTION_STATUS,
};