const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth.routes"));
router.use("/properties", require("./property.routes"));
router.use("/collections", require("./collection.routes"));
router.use("/payments", require("./payment.routes"));
router.use("/admin", require("./admin.routes"));
router.use("/webhooks", require("./webhook.routes"));

module.exports = router;