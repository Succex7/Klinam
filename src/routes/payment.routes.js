const express = require("express");
const router = express.Router();

const {
  activateSubscription,
  getSubscriptionStatus,
  getPaymentHistory,
} = require("../controllers/payment.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const { activateSubscriptionSchema } = require("../validators/payment.validator");
const ROLES = require("../config/roles");

router.use(protect, authorize(ROLES.CARETAKER));

router.post("/subscribe", validate(activateSubscriptionSchema), activateSubscription);
router.get("/subscription/:propertyId", getSubscriptionStatus);
router.get("/history/:propertyId", getPaymentHistory);

module.exports = router;