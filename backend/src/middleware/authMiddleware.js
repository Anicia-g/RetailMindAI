const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/apiResponse');
const userRepository = require('../repositories/userRepository');

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
      id: String(decoded.id || decoded.sub),
      userId: decoded.userId || (parseInt(decoded.id, 10) || null),
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      storeId: decoded.storeId || 'store-01',
      store: decoded.store || 'Indiranagar Flagship (Store 01)',
      permissions: decoded.permissions || [],
    };

    // Verify user in MySQL DB if valid numeric ID
    try {
      const userInDb = await userRepository.findById(decoded.id);
      if (userInDb) {
        if (!userRepository.toBoolean(userInDb.bit_IsActive)) {
          return errorResponse(res, 'User account is deactivated.', 403);
        }
        if (userRepository.toBoolean(userInDb.bit_Is_Locked)) {
          return errorResponse(res, 'User account is locked due to security policy.', 403);
        }
        const userDTO = userRepository.toDTO(userInDb);
        req.user = {
          ...req.user,
          ...userDTO,
          id: String(userInDb.int_User_Id),
          userId: userInDb.int_User_Id,
        };
      }
    } catch (dbErr) {
      // Keep verified JWT claims if transient query error
    }

    next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed.', 401, error.message);
  }
};

module.exports = { protect };
