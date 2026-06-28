const express = require("express");
const router = express.Router();

const {
  getAllProperties,
  getAllUsers,
  getDashboardStats,
  deactivateUser,
} = require("../controllers/admin.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const ROLES = require("../config/roles");

// Every route in this file is admin-only — apply both middlewares once at the top.
router.use(protect, authorize(ROLES.ADMIN));

router.get("/dashboard", getDashboardStats);
router.get("/properties", getAllProperties);
router.get("/users", getAllUsers);
router.patch("/users/:id/deactivate", deactivateUser);

module.exports = router;