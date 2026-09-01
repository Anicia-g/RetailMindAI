/**
 * Development Mock OTP Service
 * Isolated in-memory simulator for OTP generation, delivery, verification, and expiration.
 *
 * NOTE: This is strictly a development mock layer.
 * Production implementations will call the Express backend endpoints with SMS/Email gateways.
 */

class MockOtpService {
  constructor() {
    this.otpStore = new Map();
    this.OTP_EXPIRY_MS = 60 * 1000; // 60 seconds
    this.DEFAULT_DEV_CODE = '123456';
  }

  /**
   * Helper to mask contact identifiers for UI display (e.g. +91 98450 11234 -> +91 98450 ***34)
   */
  maskIdentifier(identifier) {
    if (!identifier) return '******';
    const str = String(identifier).trim();
    if (str.includes('@')) {
      const [name, domain] = str.split('@');
      const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
      return `${maskedName}@${domain}`;
    }
    // Phone number
    const digitsOnly = str.replace(/\D/g, '');
    if (digitsOnly.length >= 4) {
      const lastFour = digitsOnly.slice(-4);
      return `******${lastFour}`;
    }
    return `******${str.slice(-2)}`;
  }

  /**
   * Generates a 6-digit OTP code and records creation timestamp
   */
  async sendOtp(identifier, purpose = 'VERIFICATION') {
    // Simulate API roundtrip latency
    await new Promise((r) => setTimeout(r, 450));

    const cleanId = String(identifier).trim().toLowerCase();
    // Dynamic 6-digit code or fallback to standard demo code
    const generatedCode = this.DEFAULT_DEV_CODE;
    const expiresAt = Date.now() + this.OTP_EXPIRY_MS;

    this.otpStore.set(cleanId, {
      code: generatedCode,
      purpose,
      expiresAt,
      attempts: 0,
    });

    console.info(`[RetailMind Dev OTP] Sent verification code [${generatedCode}] to: ${cleanId} (Valid for 60s)`);

    return {
      success: true,
      maskedTarget: this.maskIdentifier(identifier),
      expiresInSeconds: 60,
      devHint: `Development Test Code: ${generatedCode}`,
      message: `A 6-digit verification code has been sent to ${this.maskIdentifier(identifier)}.`,
    };
  }

  /**
   * Verifies the 6-digit OTP code
   */
  async verifyOtp(identifier, enteredCode, purpose = 'VERIFICATION') {
    await new Promise((r) => setTimeout(r, 500));

    const cleanId = String(identifier).trim().toLowerCase();
    const cleanCode = String(enteredCode).trim();
    const record = this.otpStore.get(cleanId);

    // Development backdoor: always accept 123456 for predictable demo stability
    if (cleanCode === this.DEFAULT_DEV_CODE) {
      this.otpStore.delete(cleanId);
      return {
        success: true,
        message: 'Account identity verified successfully.',
      };
    }

    if (!record) {
      throw new Error('No active verification code found for this account. Please request a new OTP.');
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(cleanId);
      throw new Error('Verification code has expired. Please click Resend OTP.');
    }

    record.attempts += 1;

    if (record.code !== cleanCode) {
      if (record.attempts >= 3) {
        this.otpStore.delete(cleanId);
        throw new Error('Too many invalid attempts. Please request a new OTP.');
      }
      throw new Error(`Invalid 6-digit code. ${3 - record.attempts} attempt(s) remaining.`);
    }

    // Success - consume the OTP
    this.otpStore.delete(cleanId);
    return {
      success: true,
      message: 'Account identity verified successfully.',
    };
  }

  /**
   * Resends OTP code with a refreshed expiration timer
   */
  async resendOtp(identifier, purpose = 'VERIFICATION') {
    return this.sendOtp(identifier, purpose);
  }
}

export const mockOtpService = new MockOtpService();
