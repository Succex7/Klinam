/**
 * Wraps an async route handler and forwards any thrown error to Express's
 * next() function. This removes the need for try/catch in every controller.
 *
 * @param {Function} fn - An async Express route handler
 * @returns {Function} A standard Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;