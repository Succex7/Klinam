const express = require("express");
const router = express.Router();

const {
  reportBinFull,
  markBinEmptied,
  getCollectionHistory,
  getPendingRequests,
} = require("../controllers/collection.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const ROLES = require("../config/roles");

router.use(protect);

// Caretaker reports their bin as full.
router.post("/report/:propertyId", authorize(ROLES.CARETAKER), reportBinFull);

// Caretaker views the collection history for one of their properties.
router.get("/history/:propertyId", authorize(ROLES.CARETAKER), getCollectionHistory);

// Admin views all pending (unresolved) collection requests.
router.get("/pending", authorize(ROLES.ADMIN), getPendingRequests);

// Admin marks a specific collection request as resolved.
router.patch("/:id/resolve", authorize(ROLES.ADMIN), markBinEmptied);

module.exports = router;