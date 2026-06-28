// OPay API configuration. Values are pulled from environment variables —
// this file should never contain hardcoded credentials.
const opayConfig = Object.freeze({
  publicKey: process.env.OPAY_PUBLIC_KEY,
  secretKey: process.env.OPAY_SECRET_KEY,
  merchantId: process.env.OPAY_MERCHANT_ID,
  baseUrl: process.env.OPAY_BASE_URL,
  webhookSecret: process.env.OPAY_WEBHOOK_SECRET,
});

module.exports = opayConfig;