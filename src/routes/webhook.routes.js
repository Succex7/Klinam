const express = require("express");
const router = express.Router();

const { handleOpayWebhook } = require("../webhooks/opay.webhook");

// No authentication middleware here — OPay is not a registered user.
// The webhook handler verifies the request using HMAC signature instead.
router.post("/opay", handleOpayWebhook);

module.exports = router;