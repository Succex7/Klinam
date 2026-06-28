const Joi = require("joi");

const createPropertySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.min": "Property name must be at least 2 characters",
    "string.max": "Property name must not exceed 100 characters",
    "any.required": "Property name is required",
  }),

  description: Joi.string().trim().max(500).required().messages({
    "string.max": "Description must not exceed 500 characters",
    "any.required": "Property description is required",
  }),

  locationDescription: Joi.string().trim().max(300).required().messages({
    "string.max": "Location description must not exceed 300 characters",
    "any.required": "Location description is required",
  }),
});

const updatePropertySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).messages({
    "string.min": "Property name must be at least 2 characters",
    "string.max": "Property name must not exceed 100 characters",
  }),

  description: Joi.string().trim().max(500).messages({
    "string.max": "Description must not exceed 500 characters",
  }),

  locationDescription: Joi.string().trim().max(300).messages({
    "string.max": "Location description must not exceed 300 characters",
  }),
}).min(1); // At least one field must be provided for an update

module.exports = { createPropertySchema, updatePropertySchema };