const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  loginLimiter,
  sendOtpLimiter,
  verifyOtpLimiter,
  passwordResetLimiter,
} = require('../middleware/rateLimitMiddleware');

// 1. User Registration & Login
router.post('/register', loginLimiter, authController.register);
router.post('/register-customer', loginLimiter, authController.registerCustomerWithOtp);
router.post('/login', loginLimiter, authController.login);
router.get('/me', protect, authController.getMe);

// 2. Customer OTP Operations
router.post('/send-otp', sendOtpLimiter, authController.sendOtp);
router.post('/resend-otp', sendOtpLimiter, authController.resendOtp);
router.post('/verify-otp', verifyOtpLimiter, authController.verifyOtp);

// 3. Password Reset Flow
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);

module.exports = router;
