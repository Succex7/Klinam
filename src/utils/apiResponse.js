/**
 * Send a consistent success response.
 *
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (e.g. 200, 201)
 * @param {string} message - Human-readable success message
 * @param {object|null} data - Optional payload to include in the response
 */
const successResponse = (res, statusCode, message, data = null) => {
  const body = { success: true, message };

  if (data !== null) {
    body.data = data;
  }

  return res.status(statusCode).json(body);
};

/**
 * Send a consistent error response.
 *
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (e.g. 400, 401, 404)
 * @param {string} message - Human-readable error message
 * @param {string[]|null} errors - Optional list of specific validation errors
 */
const errorResponse = (res, statusCode, message, errors = null) => {
  const body = { success: false, message };

  if (errors !== null) {
    body.errors = errors;
  }

  return res.status(statusCode).json(body);
};

module.exports = { successResponse, errorResponse };