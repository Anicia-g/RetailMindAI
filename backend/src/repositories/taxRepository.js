const BaseRepository = require('./baseRepository');

class TaxRepository extends BaseRepository {
  constructor() {
    super('tbl_Tax', 'int_Tax_Id');
  }

  toDTO(row) {
    if (!row) return null;
    return {
      _id: String(row.int_Tax_Id),
      id: String(row.int_Tax_Id),
      taxId: row.int_Tax_Id,
      code: row.txt_Tax_Code,
      name: row.txt_Tax_Name,
      rate: Number(row.dec_Tax_Rate || row.dec_Tax_Percentage || 0),
      percentage: Number(row.dec_Tax_Percentage || row.dec_Tax_Rate || 0),
      type: row.txt_Tax_Type,
      cgstRate: Number(row.dec_CGST_Rate || 0),
      sgstRate: Number(row.dec_SGST_Rate || 0),
      igstRate: Number(row.dec_IGST_Rate || 0),
      cessRate: Number(row.dec_Cess_Rate || 0),
      isInclusive: this.toBoolean(row.bit_Is_Inclusive),
      isDefault: this.toBoolean(row.bit_Is_Default),
      isCompoundTax: this.toBoolean(row.bit_Is_Compound_Tax),
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async findByCodeOrPercentage(codeOrPct, connection = null) {
    const numPct = parseFloat(codeOrPct);
    const sql = `
      SELECT * FROM tbl_Tax 
      WHERE (txt_Tax_Code = ? OR dec_Tax_Percentage = ? OR dec_Tax_Rate = ?) 
        AND bit_IsActive = 1 
      LIMIT 1
    `;
    const rows = await this.query(sql, [String(codeOrPct), isNaN(numPct) ? -1 : numPct, isNaN(numPct) ? -1 : numPct], connection);
    return rows[0] || null;
  }

  async createTax(data, user = 'system', connection = null) {
    const taxId = data.int_Tax_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(data, user);
    const rate = auditData.dec_Tax_Rate != null ? auditData.dec_Tax_Rate : (auditData.dec_Tax_Percentage || 0);
    const sql = `
      INSERT INTO tbl_Tax (
        int_Tax_Id,
        txt_Tax_Code,
        txt_Tax_Name,
        dec_Tax_Rate,
        dec_Tax_Percentage,
        txt_Tax_Type,
        dec_CGST_Rate,
        dec_SGST_Rate,
        dec_IGST_Rate,
        dec_Cess_Rate,
        bit_Is_Inclusive,
        dte_Effective_From,
        bit_Is_Default,
        bit_Is_Compound_Tax,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      taxId,
      auditData.txt_Tax_Code || `TAX-${taxId}`,
      auditData.txt_Tax_Name,
      rate,
      auditData.dec_Tax_Percentage != null ? auditData.dec_Tax_Percentage : rate,
      auditData.txt_Tax_Type || 'GST',
      auditData.dec_CGST_Rate != null ? auditData.dec_CGST_Rate : 0,
      auditData.dec_SGST_Rate != null ? auditData.dec_SGST_Rate : 0,
      auditData.dec_IGST_Rate != null ? auditData.dec_IGST_Rate : 0,
      auditData.dec_Cess_Rate != null ? auditData.dec_Cess_Rate : (auditData.cessRate || 0),
      auditData.bit_Is_Inclusive ? 1 : 0,
      auditData.dte_Effective_From ? this.formatDate(auditData.dte_Effective_From) : this.formatDate(new Date()),
      auditData.bit_Is_Default ? 1 : 0,
      auditData.bit_Is_Compound_Tax ? 1 : 0,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Tax_Id: taxId };
  }
}

module.exports = new TaxRepository();

