const Joi = require("joi");

const activateSubscriptionSchema = Joi.object({
  // The property the caretaker wants to activate a subscription for.
  propertyId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Invalid property ID format",
    "string.length": "Invalid property ID length",
    "any.required": "Property ID is required",
  }),

  // OPay customer reference returned after the caretaker links their OPay account.
  opayCustomerReference: Joi.string().trim().required().messages({
    "any.required": "OPay customer reference is required",
  }),
});

const collectionNoteSchema = Joi.object({
  note: Joi.string().trim().max(200).optional().messages({
    "string.max": "Note must not exceed 200 characters",
  }),
});

module.exports = { activateSubscriptionSchema, collectionNoteSchema };