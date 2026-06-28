const Payment = require("../models/Payment.model");
const Subscription = require("../models/Subscription.model");
const User = require("../models/User.model");
const { verifyWebhookSignature } = require("../services/opay.service");
const notificationService = require("../services/notification.service");
const { PAYMENT_STATUS, SUBSCRIPTION_STATUS } = require("../utils/constants");
const logger = require("../utils/logger");

/**
 * Handle incoming webhook events from OPay.
 *
 * @route   POST /api/v1/webhooks/opay
 * @access  OPay servers only (verified via HMAC signature)
 *
 * Security note: This route must receive the raw request body for
 * HMAC verification to work. In app.js, the JSON body parser must
 * be configured to preserve the raw body for this path.
 *
 * OPay expects a 200 response quickly — any slow processing should
 * be deferred to a background queue in production.
 */
const handleOpayWebhook = async (req, res) => {
  const signature = req.headers["opay-signature"];

  if (!signature) {
    logger.warn("Webhook received with no OPay-Signature header.");
    return res.status(400).json({ success: false, message: "Missing signature header." });
  }

  // Verify the payload was genuinely sent by OPay.
  const rawBody = JSON.stringify(req.body);
  const isValid = verifyWebhookSignature(rawBody, signature);

  if (!isValid) {
    logger.warn("Webhook signature verification failed.");
    return res.status(401).json({ success: false, message: "Invalid signature." });
  }

  const { event, data } = req.body;

  logger.info(`OPay webhook received — Event: ${event}`);

  try {
    switch (event) {
      case "payment.success":
        await handlePaymentSuccess(data);
        break;

      case "payment.failed":
        await handlePaymentFailed(data);
        break;

      default:
        // Log unrecognised events but still return 200 so OPay does not retry.
        logger.info(`Unhandled OPay webhook event: ${event}`);
    }
  } catch (error) {
    // Log the error but still return 200. If we return a non-200 status,
    // OPay will keep retrying the same event, which can cause duplicate processing.
    logger.error("Error processing OPay webhook:", error);
  }

  return res.status(200).json({ received: true });
};

/**
 * Process a successful payment event from OPay.
 * Creates a Payment record and activates the linked subscription.
 *
 * @param {object} data - The event data payload from OPay
 */
const handlePaymentSuccess = async (data) => {
  const { reference, amount, mandateId, paidAt } = data;

  // Guard against duplicate webhook deliveries — OPay may send the same
  // event more than once. If this transaction is already recorded, skip it.
  const existingPayment = await Payment.findOne({
    opayTransactionReference: reference,
  });

  if (existingPayment) {
    logger.info(`Duplicate webhook ignored — Transaction: ${reference}`);
    return;
  }

  const subscription = await Subscription.findOne({ opayMandateId: mandateId });

  if (!subscription) {
    logger.warn(`Webhook: No subscription found for mandate ${mandateId}`);
    return;
  }

  // Record the successful payment.
  const payment = await Payment.create({
    subscription: subscription._id,
    property: subscription.property,
    owner: subscription.owner,
    opayTransactionReference: reference,
    amountKobo: amount,
    status: PAYMENT_STATUS.SUCCESS,
    paidAt: paidAt ? new Date(paidAt) : new Date(),
  });

  // Activate the subscription if this is its first successful payment.
  if (subscription.status !== SUBSCRIPTION_STATUS.ACTIVE) {
    subscription.status = SUBSCRIPTION_STATUS.ACTIVE;
    subscription.activatedAt = new Date();
  }

  // Calculate the next billing date (30 days from now).
  subscription.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await subscription.save();

  // Notify the caretaker in the background.
  const caretaker = await User.findById(subscription.owner);
  if (caretaker) {
    notificationService.notifyPaymentSuccess(payment, caretaker).catch(() => {});
  }

  logger.info(`Payment success processed — Reference: ${reference}`);
};

/**
 * Process a failed payment event from OPay.
 * Creates a failed Payment record and marks the subscription as failed.
 *
 * @param {object} data - The event data payload from OPay
 */
const handlePaymentFailed = async (data) => {
  const { reference, amount, mandateId, failureReason } = data;

  const existingPayment = await Payment.findOne({
    opayTransactionReference: reference,
  });

  if (existingPayment) {
    logger.info(`Duplicate webhook ignored — Transaction: ${reference}`);
    return;
  }

  const subscription = await Subscription.findOne({ opayMandateId: mandateId });

  if (!subscription) {
    logger.warn(`Webhook: No subscription found for mandate ${mandateId}`);
    return;
  }

  const payment = await Payment.create({
    subscription: subscription._id,
    property: subscription.property,
    owner: subscription.owner,
    opayTransactionReference: reference,
    amountKobo: amount,
    status: PAYMENT_STATUS.FAILED,
    statusMessage: failureReason || "Payment declined by provider.",
  });

  subscription.status = SUBSCRIPTION_STATUS.FAILED;
  await subscription.save();

  const caretaker = await User.findById(subscription.owner);
  if (caretaker) {
    notificationService.notifyPaymentFailed(payment, caretaker).catch(() => {});
  }

  logger.info(`Payment failure processed — Reference: ${reference}`);
};

module.exports = { handleOpayWebhook };