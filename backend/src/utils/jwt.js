const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (user) => {
  const payload = {
    sub: user._id ? user._id.toString() : user.id,
    id: user._id ? user._id.toString() : user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    storeId: user.storeId || null,
    store: user.store || null,
    permissions: user.permissions || [],
    avatar: user.avatar || 'RM',
    image: user.image || null,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
