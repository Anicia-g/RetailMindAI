const authService = require('../services/authService');
const otpService = require('../services/otpService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class AuthController {
  async register(req, res, next) {
    try {
      const reqContext = { ip: req.ip || req.connection.remoteAddress, userAgent: req.headers['user-agent'] };
      const result = await authService.register({ ...req.body, reqContext });
      return successResponse(res, result, 'Registration successful', 201);
    } catch (err) {
      if (err.message && err.message.includes('already exists')) {
        return errorResponse(res, err.message, 409);
      }
      next(err);
    }
  }

  async registerCustomerWithOtp(req, res, next) {
    try {
      const reqContext = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await authService.registerCustomerWithOtp({ ...req.body, reqContext });
      return successResponse(res, result, 'Customer registration with OTP verified successfully', 201);
    } catch (err) {
      if (err.message && err.message.includes('already exists')) {
        return errorResponse(res, err.message, 409);
      }
      if (err.message && (err.message.includes('Invalid') || err.message.includes('expired') || err.message.includes('required'))) {
        return errorResponse(res, err.message, 400);
      }
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const reqContext = { ip: req.ip || req.connection.remoteAddress, userAgent: req.headers['user-agent'] };
      const result = await authService.login(email, password, reqContext);
      return successResponse(res, result, 'Authentication successful. JWT issued.');
    } catch (err) {
      if (
        err.message &&
        (err.message.includes('Invalid') ||
          err.message.includes('required') ||
          err.message.includes('deactivated') ||
          err.message.includes('not found'))
      ) {
        return errorResponse(res, err.message, 401);
      }
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const profile = await authService.getProfile(req.user.id);
      return successResponse(res, profile, 'User profile retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async sendOtp(req, res, next) {
    try {
      const { identifier, purpose } = req.body;
      const reqContext = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await otpService.sendOtp(identifier, purpose, reqContext);
      return successResponse(res, result, result.message);
    } catch (err) {
      if (err.message && err.message.includes('wait')) {
        return errorResponse(res, err.message, 429);
      }
      next(err);
    }
  }

  async resendOtp(req, res, next) {
    try {
      const { identifier, purpose } = req.body;
      const reqContext = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await otpService.sendOtp(identifier, purpose, reqContext);
      return successResponse(res, result, result.message);
    } catch (err) {
      if (err.message && err.message.includes('wait')) {
        return errorResponse(res, err.message, 429);
      }
      next(err);
    }
  }

  async verifyOtp(req, res, next) {
    try {
      const { identifier, otp, purpose } = req.body;
      const reqContext = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await otpService.verifyOtp(identifier, otp, purpose, reqContext);
      return successResponse(res, result, result.message);
    } catch (err) {
      if (err.message && (err.message.includes('Invalid') || err.message.includes('expired') || err.message.includes('attempts') || err.message.includes('required') || err.message.includes('digits'))) {
        return errorResponse(res, err.message, 400);
      }
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { identifier, otp, newPassword } = req.body;
      const reqContext = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await otpService.resetPasswordWithOtp(identifier, otp, newPassword, reqContext);
      return successResponse(res, result, result.message);
    } catch (err) {
      if (err.message && (err.message.includes('Invalid') || err.message.includes('expired') || err.message.includes('must be at least') || err.message.includes('attempts'))) {
        return errorResponse(res, err.message, 400);
      }
      next(err);
    }
  }
}

module.exports = new AuthController();
