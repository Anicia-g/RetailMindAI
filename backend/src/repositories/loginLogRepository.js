const BaseRepository = require('./baseRepository');

class LoginLogRepository extends BaseRepository {
  constructor() {
    super('tbl_Login_Log', 'int_Login_Log_Id');
  }

  async logLogin({
    userId = null,
    ipAddress = '',
    deviceInfo = '',
    browserInfo = '',
    loginStatus = 'SUCCESS',
    failureReason = null,
    sessionId = null,
    loginMethod = 'PASSWORD',
    user = 'system',
  }, connection = null) {
    const logId = await this.getNextId(connection);
    const auditData = this.withAuditInsert(
      {
        int_Login_Log_Id: logId,
        int_User_Id: userId || 1,
        dte_Login_Date: this.formatDateTime(new Date()),
        txt_IP_Address: ipAddress || '127.0.0.1',
        txt_Device_Info: deviceInfo || 'Desktop',
        txt_Browser_Info: browserInfo || 'Chrome',
        txt_Login_Status: loginStatus,
        txt_Failure_Reason: failureReason,
        txt_Session_Id: sessionId || `sess-${Date.now()}`,
        txt_Login_Method: loginMethod,
        bit_Is_Suspicious: loginStatus === 'FAILED' ? 1 : 0,
      },
      user
    );

    const sql = `
      INSERT INTO tbl_Login_Log (
        int_Login_Log_Id,
        int_User_Id,
        dte_Login_Date,
        txt_IP_Address,
        txt_Device_Info,
        txt_Browser_Info,
        txt_Login_Status,
        txt_Failure_Reason,
        txt_Session_Id,
        txt_Login_Method,
        bit_Is_Suspicious,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      logId,
      auditData.int_User_Id,
      auditData.dte_Login_Date,
      auditData.txt_IP_Address,
      auditData.txt_Device_Info,
      auditData.txt_Browser_Info,
      auditData.txt_Login_Status,
      auditData.txt_Failure_Reason,
      auditData.txt_Session_Id,
      auditData.txt_Login_Method,
      auditData.bit_Is_Suspicious,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    try {
      await this.execute(sql, params, connection);
      return { ...auditData, int_Login_Log_Id: logId };
    } catch (err) {
      console.warn('[LoginLogRepository] Log error:', err.message);
      return null;
    }
  }
}

module.exports = new LoginLogRepository();
