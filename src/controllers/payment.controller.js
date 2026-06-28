const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const paymentService = require("../services/payment.service");
const opayService = require("../services/opay.service");

/**
 * @route   POST /api/v1/payments/subscribe
 * @access  Private (caretaker)
 *
 * Initiates the OPay recurring billing mandate for a property
 * and creates a subscription record in the database.
 */
const activateSubscription = asyncHandler(async (req, res) => {
  const { propertyId, opayCustomerReference } = req.body;

  // Step 1: Create the mandate on OPay's side.
  const opayResponse = await opayService.createMandate({
    customerReference: opayCustomerReference,
    customerName: req.user.name,
    customerPhone: req.user.phone,
    amountKobo: 500000, // 5,000 NGN in kobo — update to dynamic pricing when needed
  });

  const opayMandateId = opayResponse?.data?.mandateId;

  if (!opayMandateId) {
    const error = new Error("Failed to initialise payment mandate. Please try again.");
    error.statusCode = 502;
    throw error;
  }

  // Step 2: Save the subscription record locally.
  const subscription = await paymentService.createSubscription(
    propertyId,
    req.user._id,
    opayMandateId,
    opayCustomerReference,
    500000
  );

  return successResponse(
    res,
    201,
    "Subscription initiated. Your service will activate once the first payment is confirmed.",
    subscription
  );
});

/**
 * @route   GET /api/v1/payments/subscription/:propertyId
 * @access  Private (caretaker)
 */
const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const subscription = await paymentService.getSubscriptionStatus(
    req.params.propertyId,
    req.user._id
  );

  return successResponse(
    res,
    200,
    "Subscription status retrieved.",
    subscription
  );
});

/**
 * @route   GET /api/v1/payments/history/:propertyId
 * @access  Private (caretaker)
 */
const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await paymentService.getPaymentHistoryForProperty(
    req.params.propertyId,
    req.user._id
  );

  return successResponse(res, 200, "Payment history retrieved.", payments);
});

module.exports = {
  activateSubscription,
  getSubscriptionStatus,
  getPaymentHistory,
};