const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const auditService = require('./auditService');
const config = require('../config/env');
const db = require('../config/db');

// In-memory OTP storage conforming to zero-extra-table MySQL constraint
const otpStore = new Map();

// Periodic cleanup of expired entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of otpStore.entries()) {
    if (entry.expiresAt && new Date(entry.expiresAt).getTime() < now) {
      otpStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

class OtpService {
  /**
   * Generates a cryptographically secure 6-digit OTP and stores its bcrypt hash in memory
   */
  async sendOtp(identifier, purpose = 'VERIFICATION', reqContext = {}) {
    if (!identifier) {
      throw new Error('Email or phone number is required to send OTP.');
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();
    const storeKey = `${cleanIdentifier}:${purpose}`;

    // 1. Check Resend Cooldown (60 seconds)
    const existingOtp = otpStore.get(storeKey);
    if (existingOtp && existingOtp.lastSentAt) {
      const elapsedSeconds = Math.floor((Date.now() - new Date(existingOtp.lastSentAt).getTime()) / 1000);
      const cooldownPeriod = config.otpCooldownSeconds || 60;
      if (elapsedSeconds < cooldownPeriod) {
        const waitTime = cooldownPeriod - elapsedSeconds;
        throw new Error(`Please wait ${waitTime} seconds before requesting a new OTP.`);
      }
    }

    // 2. Generate Cryptographically Secure 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();

    // 3. Hash OTP with bcrypt
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(rawOtp, salt);

    const expiryMinutes = config.otpExpiryMinutes || 5;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // 4. Save to in-memory store
    otpStore.set(storeKey, {
      identifier: cleanIdentifier,
      otpHash,
      purpose,
      attempts: 0,
      maxAttempts: 5,
      isVerified: false,
      lastSentAt: new Date(),
      expiresAt,
    });

    // 5. Mask target identifier for safe display
    let maskedTarget = cleanIdentifier;
    if (cleanIdentifier.includes('@')) {
      const [local, domain] = cleanIdentifier.split('@');
      maskedTarget = `${local[0]}***@${domain}`;
    } else if (cleanIdentifier.length > 6) {
      maskedTarget = `${cleanIdentifier.slice(0, 3)}***${cleanIdentifier.slice(-3)}`;
    }

    // 6. Audit log
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

    // Secure logging: dev mode helper
    if (config.env === 'development' || process.env.NODE_ENV === 'development') {
      console.log(`[OTP Service Dev Mode] Generated OTP for ${cleanIdentifier} [Purpose: ${purpose}]: ${rawOtp}`);
    }

    return {
      success: true,
      message: `OTP sent successfully. Valid for ${expiryMinutes} minutes.`,
      maskedTarget,
      expiresIn: expiryMinutes * 60,
      cooldownSeconds: config.otpCooldownSeconds || 60,
      devOtp: (config.env === 'development' || process.env.NODE_ENV === 'development') ? rawOtp : undefined,
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
    const storeKey = `${cleanIdentifier}:${purpose}`;

    if (!/^\d{6}$/.test(cleanOtp)) {
      throw new Error('OTP code must be exactly 6 numeric digits.');
    }

    const otpEntry = otpStore.get(storeKey);

    if (!otpEntry) {
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
    if (new Date() > new Date(otpEntry.expiresAt)) {
      otpStore.delete(storeKey);
      throw new Error('Verification code has expired. Please request a new OTP.');
    }

    // Check attempt limits (max 5)
    if (otpEntry.attempts >= otpEntry.maxAttempts) {
      otpStore.delete(storeKey);
      throw new Error('Too many invalid attempts. For your security, this code has been invalidated.');
    }

    // Verify bcrypt hash
    const isMatch = await bcrypt.compare(cleanOtp, otpEntry.otpHash);
    if (!isMatch) {
      otpEntry.attempts += 1;
      const remainingAttempts = Math.max(0, otpEntry.maxAttempts - otpEntry.attempts);

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
        otpStore.delete(storeKey);
        throw new Error('Too many invalid attempts. Verification code has been invalidated.');
      }

      throw new Error(`Invalid verification code. ${remainingAttempts} attempts remaining.`);
    }

    otpEntry.isVerified = true;

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
    const storeKey = `${cleanIdentifier}:PASSWORD_RESET`;

    // Verify OTP first
    await this.verifyOtp(cleanIdentifier, rawOtp, 'PASSWORD_RESET', reqContext);

    // Find user by email or phone in MySQL tbl_User
    const users = await db.query(
      'SELECT * FROM tbl_User WHERE (LOWER(txt_Email) = ? OR txt_Phone_Number = ?) AND bit_IsActive = 1 LIMIT 1',
      [cleanIdentifier, cleanIdentifier]
    );

    if (users.length === 0) {
      // Account enumeration protection: Return generic success response
      otpStore.delete(storeKey);
      return {
        success: true,
        message: 'Password reset request processed. You may now sign in with your updated credentials.',
      };
    }

    const user = users[0];
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await userRepository.updatePassword(user.int_User_Id, passwordHash, 'OTP_RESET');

    // Clean up verified OTP
    otpStore.delete(storeKey);

    await auditService.logSecurityEvent({
      action: 'PASSWORD_RESET_SUCCESS',
      userId: String(user.int_User_Id),
      email: user.txt_Email,
      role: 'USER',
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
