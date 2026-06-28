const axios = require("axios");
const crypto = require("crypto");
const opayConfig = require("../config/opay");
const logger = require("../utils/logger");

/**
 * Build the Authorization header required by OPay's API.
 * OPay expects: Authorization: Bearer <base64(publicKey:secretKey)>
 *
 * @returns {string} The encoded authorization string
 */
const buildAuthHeader = () => {
  const credentials = `${opayConfig.publicKey}:${opayConfig.secretKey}`;
  return `Bearer ${Buffer.from(credentials).toString("base64")}`;
};

/**
 * Initiate a recurring billing mandate on OPay.
 * Called when a caretaker clicks "Activate Service" and links their OPay account.
 *
 * @param {object} data - { customerReference, customerName, customerPhone, amountKobo }
 * @returns {object} OPay mandate response containing the mandateId
 */
const createMandate = async (data) => {
  const { customerReference, customerName, customerPhone, amountKobo } = data;

  try {
    const response = await axios.post(
      `${opayConfig.baseUrl}/api/v1/international/cashier/create`,
      {
        merchantId: opayConfig.merchantId,
        reference: customerReference,
        amount: {
          currency: "NGN",
          total: amountKobo,
        },
        customerInfo: {
          customerId: customerReference,
          customerName,
          customerPhone,
        },
        callbackUrl: `${process.env.CLIENT_URL}/payment/callback`,
      },
      {
        headers: {
          Authorization: buildAuthHeader(),
          "Content-Type": "application/json",
          MerchantId: opayConfig.merchantId,
        },
      }
    );

    return response.data;
  } catch (error) {
    logger.error("OPay createMandate failed:", error?.response?.data || error.message);
    const serviceError = new Error(
      "Payment service is unavailable. Please try again later."
    );
    serviceError.statusCode = 502;
    throw serviceError;
  }
};

/**
 * Verify the HMAC signature on an incoming OPay webhook request.
 * OPay signs the raw request body with the webhook secret. If the signature
 * does not match, the request must be rejected — it did not come from OPay.
 *
 * @param {string} rawBody - The raw request body string (before JSON.parse)
 * @param {string} receivedSignature - The signature from the OPay-Signature header
 * @returns {boolean} True if the signature is valid
 */
const verifyWebhookSignature = (rawBody, receivedSignature) => {
  const expectedSignature = crypto
    .createHmac("sha512", opayConfig.webhookSecret)
    .update(rawBody)
    .digest("hex");

  // Use timingSafeEqual to prevent timing attacks.
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(receivedSignature, "hex")
  );
};

module.exports = { createMandate, verifyWebhookSignature };