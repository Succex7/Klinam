/**
 * Authorization middleware — restricts route access to specific roles.
 * Must be used after the protect middleware so req.user is already set.
 *
 * Usage: router.get("/admin/stats", protect, authorize("admin"), handler)
 *
 * @param {...string} roles - One or more allowed role strings
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route requires the '${roles.join(" or ")}' role.`,
      });
    }

    next();
  };
};

module.exports = { authorize };