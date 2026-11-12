const auditLogRepository = require('../repositories/auditLogRepository');
const loginLogRepository = require('../repositories/loginLogRepository');

class AuditService {
  /**
   * Logs a user login event (Success or Failed)
   */
  async logLogin({ userId, email, role, status = 'SUCCESS', reason = '', ipAddress = '', userAgent = '' }) {
    try {
      await loginLogRepository.logLogin({
        userId: userId ? (parseInt(userId, 10) || null) : null,
        ipAddress: ipAddress || '127.0.0.1',
        browserInfo: userAgent || 'Browser',
        loginStatus: status,
        failureReason: reason || null,
        user: email || 'system',
      });
    } catch (error) {
      console.warn('[AuditService] logLogin warning:', error.message);
    }
  }

  /**
   * Logs a security or domain event
   */
  async logSecurityEvent({
    action,
    userId = null,
    email = '',
    role = '',
    resource = 'AUTH',
    status = 'SUCCESS',
    ipAddress = '',
    userAgent = '',
    details = null,
  }) {
    try {
      await auditLogRepository.logEvent({
        userId: userId ? (parseInt(userId, 10) || null) : null,
        tableName: resource,
        recordId: userId ? String(userId) : null,
        actionType: action,
        newValue: details,
        ipAddress: ipAddress || '127.0.0.1',
        moduleName: 'SECURITY',
        severityLevel: status === 'FAILED' ? 'HIGH' : 'INFO',
        user: email || 'system',
      });
    } catch (error) {
      console.warn('[AuditService] logSecurityEvent warning:', error.message);
    }
  }

  /**
   * General purpose change audit logger
   */
  async logChange({
    tableName,
    recordId,
    action,
    oldValue = null,
    newValue = null,
    user = 'system',
    reason = '',
    ipAddress = '127.0.0.1',
  }) {
    try {
      await auditLogRepository.logEvent({
        tableName,
        recordId: String(recordId),
        actionType: action,
        oldValue,
        newValue,
        changeReason: reason,
        ipAddress,
        user,
      });
    } catch (error) {
      console.warn('[AuditService] logChange warning:', error.message);
    }
  }
}

module.exports = new AuditService();
