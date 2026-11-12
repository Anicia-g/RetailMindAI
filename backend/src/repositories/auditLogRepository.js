const BaseRepository = require('./baseRepository');

class AuditLogRepository extends BaseRepository {
  constructor() {
    super('tbl_Audit_Log', 'int_Audit_Log_Id');
  }

  async logEvent({
    userId = null,
    tableName = 'SYSTEM',
    recordId = null,
    actionType = 'INFO',
    oldValue = null,
    newValue = null,
    ipAddress = '127.0.0.1',
    sessionId = null,
    moduleName = 'GENERAL',
    changeReason = null,
    requestId = null,
    deviceInfo = 'Desktop',
    severityLevel = 'INFO',
    user = 'system',
  }, connection = null) {
    const auditId = await this.getNextId(connection);
    const auditData = this.withAuditInsert(
      {
        int_Audit_Log_Id: auditId,
        int_User_Id: userId ? (parseInt(userId, 10) || 1) : 1,
        txt_Table_Name: tableName,
        txt_Record_Id: recordId ? String(recordId) : null,
        txt_Action_Type: actionType,
        txt_Old_Value: oldValue ? (typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue)) : null,
        txt_New_Value: newValue ? (typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)) : null,
        txt_IP_Address: ipAddress,
        txt_Session_Id: sessionId || `req-${Date.now()}`,
        txt_Module_Name: moduleName,
        dte_Action_Date: this.formatDateTime(new Date()),
        txt_Change_Reason: changeReason,
        txt_Request_Id: requestId || `req-${Date.now()}`,
        txt_Device_Info: deviceInfo,
        txt_Severity_Level: severityLevel,
      },
      user
    );

    const sql = `
      INSERT INTO tbl_Audit_Log (
        int_Audit_Log_Id,
        int_User_Id,
        txt_Table_Name,
        txt_Record_Id,
        txt_Action_Type,
        txt_Old_Value,
        txt_New_Value,
        txt_IP_Address,
        txt_Session_Id,
        txt_Module_Name,
        dte_Action_Date,
        txt_Change_Reason,
        txt_Request_Id,
        txt_Device_Info,
        txt_Severity_Level,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      auditId,
      auditData.int_User_Id,
      auditData.txt_Table_Name,
      auditData.txt_Record_Id,
      auditData.txt_Action_Type,
      auditData.txt_Old_Value,
      auditData.txt_New_Value,
      auditData.txt_IP_Address,
      auditData.txt_Session_Id,
      auditData.txt_Module_Name,
      auditData.dte_Action_Date,
      auditData.txt_Change_Reason,
      auditData.txt_Request_Id,
      auditData.txt_Device_Info,
      auditData.txt_Severity_Level,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    try {
      await this.execute(sql, params, connection);
      return { ...auditData, int_Audit_Log_Id: auditId };
    } catch (err) {
      console.warn('[AuditLogRepository] Audit write warning:', err.message);
      return null;
    }
  }
}

module.exports = new AuditLogRepository();
