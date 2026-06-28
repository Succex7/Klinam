/**
 * Factory function that returns a middleware which validates req.body
 * against the given Joi schema.
 *
 * abortEarly: false ensures all validation errors are returned at once,
 * not just the first one encountered.
 *
 * @param {object} schema - A Joi schema object
 * @returns {Function} Express middleware
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false, // Reject any fields not defined in the schema
    stripUnknown: false,
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

module.exports = validate;