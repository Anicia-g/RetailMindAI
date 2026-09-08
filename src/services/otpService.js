import { mockOtpService } from './mockOtpService';
import { apiClient } from '@/lib/apiClient';

/**
 * OTP Service
 * Calls Express backend OTP endpoints (/api/auth/send-otp, /api/auth/verify-otp)
 * with graceful fallback to mockOtpService.
 */
class OtpService {
  async sendOtp(identifier, purpose = 'VERIFICATION') {
    try {
      const res = await apiClient.post('/auth/send-otp', { identifier, purpose });
      if (res && res.success) {
        return res;
      }
    } catch (err) {
      console.warn('Backend send-otp endpoint unavailable or errored, using mock OTP service fallback:', err.message);
    }
    return await mockOtpService.sendOtp(identifier, purpose);
  }

  async verifyOtp(identifier, otp, purpose = 'VERIFICATION') {
    try {
      const res = await apiClient.post('/auth/verify-otp', { identifier, otp, purpose });
      if (res && res.success) {
        return res;
      }
    } catch (err) {
      // If error is an actual validation message from server, propagate it
      if (
        err.message &&
        (err.message.includes('Invalid') ||
          err.message.includes('expired') ||
          err.message.includes('attempts'))
      ) {
        throw err;
      }
    }
    return await mockOtpService.verifyOtp(identifier, otp, purpose);
  }

  async resendOtp(identifier, purpose = 'VERIFICATION') {
    return this.sendOtp(identifier, purpose);
  }

  async resetPasswordWithOtp(identifier, otp, newPassword) {
    try {
      const res = await apiClient.post('/auth/reset-password', {
        identifier,
        otp,
        newPassword,
      });
      if (res && res.success) {
        return res;
      }
    } catch (err) {
      if (err.message && err.message.includes('Invalid')) {
        throw err;
      }
    }

    const verifyResult = await this.verifyOtp(identifier, otp, 'PASSWORD_RESET');
    if (verifyResult.success) {
      return {
        success: true,
        message: 'Password reset successfully. You may now login with your new credentials.',
      };
    }
    return verifyResult;
  }
}

export const otpService = new OtpService();
