const BaseRepository = require('./baseRepository');

class PaymentMethodRepository extends BaseRepository {
  constructor() {
    super('tbl_Payment_Method', 'int_Payment_Method_Id');
  }

  toDTO(row) {
    if (!row) return null;
    return {
      _id: String(row.int_Payment_Method_Id),
      id: String(row.int_Payment_Method_Id),
      paymentMethodId: row.int_Payment_Method_Id,
      code: row.txt_Payment_Method_Code,
      name: row.txt_Payment_Method_Name,
      type: row.txt_Payment_Type,
      description: row.txt_Description,
      requiresReference: this.toBoolean(row.bit_Requires_Reference_Number),
      isOnline: this.toBoolean(row.bit_Is_Online),
      isActiveForPos: this.toBoolean(row.bit_Is_Active_For_POS),
      requiresOtp: this.toBoolean(row.bit_Requires_OTP_Verification),
      transactionFeePercentage: Number(row.dec_Transaction_Fee_Percentage || 0),
      requiresReconciliation: this.toBoolean(row.bit_Requires_Reconciliation),
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async findByCodeOrName(identifier, connection = null) {
    const sql = `
      SELECT * FROM tbl_Payment_Method 
      WHERE (txt_Payment_Method_Code = ? OR LOWER(txt_Payment_Method_Name) = LOWER(?)) 
        AND bit_IsActive = 1 
      LIMIT 1
    `;
    const rows = await this.query(sql, [identifier, identifier], connection);
    return rows[0] || null;
  }

  async createPaymentMethod(data, user = 'system', connection = null) {
    const pmId = data.int_Payment_Method_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(data, user);
    const sql = `
      INSERT INTO tbl_Payment_Method (
        int_Payment_Method_Id,
        txt_Payment_Method_Code,
        txt_Payment_Method_Name,
        txt_Payment_Type,
        txt_Description,
        bit_Requires_Reference_Number,
        bit_Is_Online,
        bit_Is_Active_For_POS,
        bit_Requires_OTP_Verification,
        dec_Transaction_Fee_Percentage,
        bit_Requires_Reconciliation,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      pmId,
      auditData.txt_Payment_Method_Code || auditData.txt_Method_Code,
      auditData.txt_Payment_Method_Name || auditData.txt_Method_Name,
      auditData.txt_Payment_Type || auditData.txt_Method_Type || 'DIGITAL',
      auditData.txt_Description || null,
      auditData.bit_Requires_Reference_Number ? 1 : 0,
      auditData.bit_Is_Online ? 1 : 0,
      auditData.bit_Is_Active_For_POS ? 1 : 1,
      auditData.bit_Requires_OTP_Verification ? 1 : 0,
      auditData.dec_Transaction_Fee_Percentage || 0,
      auditData.bit_Requires_Reconciliation ? 1 : 0,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Payment_Method_Id: pmId };
  }
}

module.exports = new PaymentMethodRepository();
