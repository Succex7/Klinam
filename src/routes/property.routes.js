const express = require("express");
const router = express.Router();

const {
  createProperty,
  getMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} = require("../controllers/property.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createPropertySchema,
  updatePropertySchema,
} = require("../validators/property.validator");
const ROLES = require("../config/roles");

// All property routes require authentication.
router.use(protect);

router
  .route("/")
  .get(authorize(ROLES.CARETAKER), getMyProperties)
  .post(authorize(ROLES.CARETAKER), validate(createPropertySchema), createProperty);

router
  .route("/:id")
  .get(getPropertyById) // Accessible by both roles — ownership check is inside the service
  .patch(authorize(ROLES.CARETAKER), validate(updatePropertySchema), updateProperty)
  .delete(authorize(ROLES.CARETAKER), deleteProperty);

module.exports = router;