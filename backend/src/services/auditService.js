const AuditLog = require('../models/AuditLog');
const LoginLog = require('../models/LoginLog');

class AuditService {
  /**
   * Records a user authentication event in tbl_Login_Log
   */
  async logLogin({ userId = '', email = '', role = 'CUSTOMER', status = 'SUCCESS', ipAddress = '', userAgent = '', reason = '' }) {
    try {
      await LoginLog.create({
        userId: String(userId || ''),
        email: String(email || '').toLowerCase(),
        role: String(role || 'CUSTOMER').toUpperCase(),
        status: status === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
        reason: String(reason || ''),
        ipAddress: String(ipAddress || ''),
        userAgent: String(userAgent || ''),
        loginAt: new Date(),
        txt_Created_By: String(userId || email || 'system'),
        dte_Created_Date: new Date(),
      });
    } catch (err) {
      console.warn('[AuditService] Login log write notice:', err.message);
    }
  }

  /**
   * Records a security-sensitive business or authorization event in tbl_Audit_Log
   */
  async logSecurityEvent({
    action,
    userId = 'system',
    email = '',
    role = 'SYSTEM',
    resource = '',
    status = 'SUCCESS',
    ipAddress = '',
    userAgent = '',
    details = {},
  }) {
    try {
      // Sanitize details: strip any password, secret, token, or OTP fields
      const sanitizedDetails = { ...details };
      delete sanitizedDetails.password;
      delete sanitizedDetails.passwordHash;
      delete sanitizedDetails.otp;
      delete sanitizedDetails.rawOtp;
      delete sanitizedDetails.token;
      delete sanitizedDetails.jwt;
      delete sanitizedDetails.secret;

      await AuditLog.create({
        action,
        userId: String(userId || 'system'),
        email: String(email || ''),
        role: String(role || 'SYSTEM'),
        resource: String(resource || ''),
        status,
        ipAddress: String(ipAddress || ''),
        userAgent: String(userAgent || ''),
        details: sanitizedDetails,
        txt_Created_By: String(userId || email || 'system'),
        dte_Created_Date: new Date(),
      });
    } catch (err) {
      console.warn('[AuditService] Audit log write notice:', err.message);
    }
  }
}

module.exports = new AuditService();
