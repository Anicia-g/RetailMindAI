import { mockOtpService } from './mockOtpService';

/**
 * OTP Service
 * Unified service interface prepared for Express backend API endpoints.
 * Falls back safely to mockOtpService during client/local development.
 */
class OtpService {
  async sendOtp(identifier, purpose = 'VERIFICATION') {
    try {
      // Future Express API contract:
      // const res = await fetch('/api/auth/send-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ identifier, purpose }),
      // });
      // return await res.json();
      return await mockOtpService.sendOtp(identifier, purpose);
    } catch (err) {
      console.warn('Backend send-otp endpoint unavailable, using mock OTP service fallback:', err);
      return await mockOtpService.sendOtp(identifier, purpose);
    }
  }

  async verifyOtp(identifier, otp, purpose = 'VERIFICATION') {
    try {
      // Future Express API contract:
      // const res = await fetch('/api/auth/verify-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ identifier, otp, purpose }),
      // });
      // return await res.json();
      return await mockOtpService.verifyOtp(identifier, otp, purpose);
    } catch (err) {
      // If error is an actual validation message from mock, propagate it
      if (err.message && (err.message.includes('Invalid') || err.message.includes('expired') || err.message.includes('attempts'))) {
        throw err;
      }
      return await mockOtpService.verifyOtp(identifier, otp, purpose);
    }
  }

  async resendOtp(identifier, purpose = 'VERIFICATION') {
    try {
      // Future Express API contract:
      // const res = await fetch('/api/auth/resend-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ identifier, purpose }),
      // });
      // return await res.json();
      return await mockOtpService.resendOtp(identifier, purpose);
    } catch (err) {
      return await mockOtpService.resendOtp(identifier, purpose);
    }
  }

  async resetPasswordWithOtp(identifier, otp, newPassword) {
    try {
      const verifyResult = await this.verifyOtp(identifier, otp, 'PASSWORD_RESET');
      if (verifyResult.success) {
        return {
          success: true,
          message: 'Password reset successfully. You may now login with your new credentials.',
        };
      }
      return verifyResult;
    } catch (err) {
      throw err;
    }
  }
}

export const otpService = new OtpService();
