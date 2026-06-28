const Joi = require("joi");

// Phone number: optional leading '+', then 10–15 digits.
const phonePattern = /^\+?[0-9]{10,15}$/;

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 80 characters",
    "any.required": "Name is required",
  }),

  phone: Joi.string().trim().pattern(phonePattern).required().messages({
    "string.pattern.base": "Phone number must be between 10 and 15 digits",
    "any.required": "Phone number is required",
  }),

  password: Joi.string().min(8).max(72).required().messages({
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is required",
  }),

  // Confirm password must match password exactly.
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Please confirm your password",
  }),
});

const loginSchema = Joi.object({
  phone: Joi.string().trim().pattern(phonePattern).required().messages({
    "string.pattern.base": "Enter a valid phone number",
    "any.required": "Phone number is required",
  }),

  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

module.exports = { registerSchema, loginSchema };