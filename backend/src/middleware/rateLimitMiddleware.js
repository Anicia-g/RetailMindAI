const { errorResponse } = require('../utils/apiResponse');

// In-memory request tracking map
const requestStore = new Map();

// Periodic cleanup of expired entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestStore.entries()) {
    if (now > record.resetTime) {
      requestStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Creates a rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Max requests allowed in the window
 * @param {string} options.message - Error message when rate limit exceeded
 * @param {function} options.keyGenerator - Function returning the tracking key
 */
const rateLimiter = ({
  windowMs = 60 * 1000,
  maxRequests = 10,
  message = 'Too many requests. Please slow down and try again later.',
  keyGenerator = (req) => req.ip || req.headers['x-forwarded-for'] || 'client-ip',
}) => {
  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    const record = requestStore.get(key) || {
      count: 0,
      resetTime: now + windowMs,
    };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    requestStore.set(key, record);

    if (record.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return errorResponse(res, message, 429, { retryAfterSeconds });
    }

    next();
  };
};

const loginLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 15,
  message: 'Too many login attempts. Please wait 1 minute before trying again.',
});

const sendOtpLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: 'Too many OTP requests. Please wait 1 minute before requesting another code.',
  keyGenerator: (req) => `otp-send-${req.body?.identifier || req.ip}`,
});

const verifyOtpLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 15,
  message: 'Too many verification attempts. Please wait 1 minute.',
  keyGenerator: (req) => `otp-verify-${req.body?.identifier || req.ip}`,
});

const passwordResetLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Too many password reset requests. Please wait 1 minute.',
});

module.exports = {
  rateLimiter,
  loginLimiter,
  sendOtpLimiter,
  verifyOtpLimiter,
  passwordResetLimiter,
};
