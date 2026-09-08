const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Otp = require('../models/Otp');
const User = require('../models/User');
const auditService = require('./auditService');
const config = require('../config/env');

class OtpService {
  /**
   * Generates a cryptographically secure 6-digit OTP and stores its bcrypt hash
   */
  async sendOtp(identifier, purpose = 'VERIFICATION', reqContext = {}) {
    if (!identifier) {
      throw new Error('Email or phone number is required to send OTP.');
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();

    // 1. Check Resend Cooldown (60 seconds)
    const existingOtp = await Otp.findOne({
      identifier: cleanIdentifier,
      purpose,
      isVerified: false,
    }).sort({ createdAt: -1 });

    if (existingOtp && existingOtp.lastSentAt) {
      const elapsedSeconds = Math.floor((Date.now() - new Date(existingOtp.lastSentAt).getTime()) / 1000);
      const cooldownPeriod = config.otpCooldownSeconds || 60;
      if (elapsedSeconds < cooldownPeriod) {
        const waitTime = cooldownPeriod - elapsedSeconds;
        throw new Error(`Please wait ${waitTime} seconds before requesting a new OTP.`);
      }
    }

    // 2. Generate Cryptographically Secure 6-digit numeric OTP
    // In strict production, crypto.randomInt(100000, 1000000) generates uniformly distributed 6-digit ints
    const rawOtp = crypto.randomInt(100000, 1000000).toString();

    // 3. Hash OTP with bcrypt
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(rawOtp, salt);

    const expiryMinutes = config.otpExpiryMinutes || 5;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // 4. Invalidate prior active OTPs for this identifier & purpose
    await Otp.deleteMany({ identifier: cleanIdentifier, purpose });

    await Otp.create({
      identifier: cleanIdentifier,
      otpHash,
      purpose,
      attempts: 0,
      maxAttempts: 5,
      isVerified: false,
      lastSentAt: new Date(),
      expiresAt,
    });

    // 5. Mask target identifier for safe display (e.g. j***@example.com or +91 98*** 1234)
    let maskedTarget = cleanIdentifier;
    if (cleanIdentifier.includes('@')) {
      const [local, domain] = cleanIdentifier.split('@');
      maskedTarget = `${local[0]}***@${domain}`;
    } else if (cleanIdentifier.length > 6) {
      maskedTarget = `${cleanIdentifier.slice(0, 3)}***${cleanIdentifier.slice(-3)}`;
    }

    // Audit log
    await auditService.logSecurityEvent({
      action: 'OTP_SENT',
      userId: cleanIdentifier,
      email: cleanIdentifier.includes('@') ? cleanIdentifier : '',
      resource: 'AUTH_OTP',
      status: 'SUCCESS',
      ipAddress: reqContext.ip || '',
      userAgent: reqContext.userAgent || '',
      details: { purpose, expiresInMinutes: expiryMinutes },
    });

    // Secure logging: never print raw OTP in production
    if (config.env === 'development') {
      console.log(`[OTP Service Dev Mode] Generated OTP for ${cleanIdentifier} [Purpose: ${purpose}]: ${rawOtp}`);
    }

    return {
      success: true,
      message: `OTP sent successfully. Valid for ${expiryMinutes} minutes.`,
      maskedTarget,
      expiresIn: expiryMinutes * 60,
      cooldownSeconds: config.otpCooldownSeconds || 60,
      // Debug OTP only returned if explicitly enabled in local dev environment
      devOtp: config.env === 'development' && config.otpDevAutoVerify ? rawOtp : undefined,
    };
  }

  /**
   * Verifies the submitted OTP against the stored bcrypt hash with strict attempt limits
   */
  async verifyOtp(identifier, rawOtp, purpose = 'VERIFICATION', reqContext = {}) {
    if (!identifier || !rawOtp) {
      throw new Error('Identifier and 6-digit OTP code are required.');
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();
    const cleanOtp = String(rawOtp).trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      throw new Error('OTP code must be exactly 6 numeric digits.');
    }

    const otpDoc = await Otp.findOne({
      identifier: cleanIdentifier,
      purpose,
      isVerified: false,
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      await auditService.logSecurityEvent({
        action: 'OTP_VERIFY_FAILED',
        userId: cleanIdentifier,
        resource: 'AUTH_OTP',
        status: 'FAILED',
        ipAddress: reqContext.ip || '',
        userAgent: reqContext.userAgent || '',
        details: { reason: 'No active OTP found' },
      });
      throw new Error('Invalid or expired verification code. Please request a new OTP.');
    }

    // Check expiration
    if (new Date() > otpDoc.expiresAt) {
      await Otp.deleteOne({ _id: otpDoc._id });
      throw new Error('Verification code has expired. Please request a new OTP.');
    }

    // Check attempt limits (max 5)
    if (otpDoc.attempts >= otpDoc.maxAttempts) {
      await Otp.deleteOne({ _id: otpDoc._id });
      throw new Error('Too many invalid attempts. For your security, this code has been invalidated.');
    }

    // Verify bcrypt hash
    const isMatch = await bcrypt.compare(cleanOtp, otpDoc.otpHash);
    if (!isMatch) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      const remainingAttempts = Math.max(0, otpDoc.maxAttempts - otpDoc.attempts);

      await auditService.logSecurityEvent({
        action: 'OTP_VERIFY_FAILED',
        userId: cleanIdentifier,
        resource: 'AUTH_OTP',
        status: 'FAILED',
        ipAddress: reqContext.ip || '',
        userAgent: reqContext.userAgent || '',
        details: { remainingAttempts },
      });

      if (remainingAttempts === 0) {
        await Otp.deleteOne({ _id: otpDoc._id });
        throw new Error('Too many invalid attempts. Verification code has been invalidated.');
      }

      throw new Error(`Invalid verification code. ${remainingAttempts} attempts remaining.`);
    }

    otpDoc.isVerified = true;
    await otpDoc.save();

    await auditService.logSecurityEvent({
      action: 'OTP_VERIFY_SUCCESS',
      userId: cleanIdentifier,
      resource: 'AUTH_OTP',
      status: 'SUCCESS',
      ipAddress: reqContext.ip || '',
      userAgent: reqContext.userAgent || '',
      details: { purpose },
    });

    return {
      success: true,
      message: 'OTP verified successfully.',
      verified: true,
    };
  }

  /**
   * Resets password using verified OTP with account enumeration protection
   */
  async resetPasswordWithOtp(identifier, rawOtp, newPassword, reqContext = {}) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();

    // Verify OTP first
    await this.verifyOtp(cleanIdentifier, rawOtp, 'PASSWORD_RESET', reqContext);

    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { phone: cleanIdentifier }],
    }).select('+passwordHash');

    if (!user) {
      // Account enumeration protection: Return generic success response
      return {
        success: true,
        message: 'Password reset request processed. You may now sign in with your updated credentials.',
      };
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Clean up verified OTP
    await Otp.deleteMany({ identifier: cleanIdentifier, purpose: 'PASSWORD_RESET' });

    await auditService.logSecurityEvent({
      action: 'PASSWORD_RESET_SUCCESS',
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      resource: 'AUTH_PASSWORD',
      status: 'SUCCESS',
      ipAddress: reqContext.ip || '',
      userAgent: reqContext.userAgent || '',
    });

    return {
      success: true,
      message: 'Password reset successfully. You may now sign in with your new credentials.',
    };
  }
}

module.exports = new OtpService();
