const logger = require("../utils/logger");

// This service is a placeholder for future notification delivery.
// When you integrate SMS (e.g. Termii, Africa's Talking) or email,
// the implementation goes here. Controllers and services already call
// these functions, so adding the real provider later requires no
// changes to other files.

/**
 * Notify the operations team that a bin has been reported full.
 *
 * @param {object} property - The property document
 * @param {object} caretaker - The caretaker's user document
 */
const notifyAdminBinReported = async (property, caretaker) => {
  logger.info(
    `[NOTIFICATION] Bin reported full — Property: "${property.name}" | Caretaker: ${caretaker.name} (${caretaker.phone})`
  );

  // TODO: Send SMS or push notification to the operations team
};

/**
 * Notify the caretaker that their bin has been emptied.
 *
 * @param {object} property - The property document
 * @param {object} caretaker - The caretaker's user document
 */
const notifyCaretakerBinEmptied = async (property, caretaker) => {
  logger.info(
    `[NOTIFICATION] Bin emptied — Property: "${property.name}" | Caretaker: ${caretaker.name} (${caretaker.phone})`
  );

  // TODO: Send SMS or push notification to the caretaker
};

/**
 * Notify the caretaker that a payment was successful.
 *
 * @param {object} payment - The payment document
 * @param {object} caretaker - The caretaker's user document
 */
const notifyPaymentSuccess = async (payment, caretaker) => {
  logger.info(
    `[NOTIFICATION] Payment successful — Amount: ${payment.amountKobo / 100} NGN | Caretaker: ${caretaker.name}`
  );

  // TODO: Send payment confirmation SMS or email
};

/**
 * Notify the caretaker that a payment failed.
 *
 * @param {object} payment - The payment document
 * @param {object} caretaker - The caretaker's user document
 */
const notifyPaymentFailed = async (payment, caretaker) => {
  logger.info(
    `[NOTIFICATION] Payment failed — Caretaker: ${caretaker.name} (${caretaker.phone})`
  );

  // TODO: Send failure alert with instructions to update payment method
};

module.exports = {
  notifyAdminBinReported,
  notifyCaretakerBinEmptied,
  notifyPaymentSuccess,
  notifyPaymentFailed,
};