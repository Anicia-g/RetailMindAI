const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/apiResponse');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.retailmind_token) {
    token = req.cookies.retailmind_token;
  }

  if (!token) {
    return errorResponse(res, 'Access denied. Authentication token required.', 401);
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse(res, 'Invalid or expired token. Please log in again.', 401);
    }

    // Attach basic claims from token immediately
    req.user = {
      id: decoded.id || decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      storeId: decoded.storeId || 'store-01',
      store: decoded.store || 'Indiranagar Flagship (Store 01)',
      permissions: decoded.permissions || [],
    };

    // Optionally check if user exists and is active in DB
    try {
      const userInDb = await User.findById(decoded.id).select('-passwordHash');
      if (userInDb) {
        if (!userInDb.bit_IsActive) {
          return errorResponse(res, 'User account is deactivated.', 403);
        }
        req.user = {
          ...req.user,
          ...userInDb.toJSON(),
          id: userInDb._id.toString(),
        };
      }
    } catch (dbErr) {
      // If DB is temporarily querying or ID was mock, keep the valid verified JWT payload
    }

    next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed.', 401, error.message);
  }
};

module.exports = { protect };
