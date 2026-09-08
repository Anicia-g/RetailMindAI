const { errorResponse } = require('../utils/apiResponse');

/**
 * Enforce role-based access control (RBAC)
 * @param  {...string|string[]} roles Allowed roles (e.g. 'ADMIN', 'SELLER', 'CUSTOMER')
 */
const requireRole = (...roles) => {
  const flatRoles = roles.flat().map((r) => r.toUpperCase());

  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required before role authorization.', 401);
    }

    const userRole = (req.user.role || '').toUpperCase();

    if (!flatRoles.includes(userRole)) {
      return errorResponse(
        res,
        `Access denied. Role '${userRole}' is not authorized to access this resource.`,
        403
      );
    }

    next();
  };
};

/**
 * Check if the seller belongs to the requested store
 */
const requireStoreMatch = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required.', 401);
  }

  // Admin has global cross-store access
  if (req.user.role === 'ADMIN') {
    return next();
  }

  const requestedStoreId = req.params.storeId || req.query.storeId || req.body.storeId;
  if (!requestedStoreId) {
    return next();
  }

  if (req.user.storeId && req.user.storeId !== requestedStoreId) {
    return errorResponse(
      res,
      'Access denied. You can only access operations for your assigned store.',
      403
    );
  }

  next();
};

module.exports = {
  requireRole,
  requireStoreMatch,
};
