const BaseRepository = require('./baseRepository');

class SupplierRepository extends BaseRepository {
  constructor() {
    super('tbl_Supplier', 'int_Supplier_Id');
  }

  toDTO(row) {
    if (!row) return null;
    return {
      _id: String(row.int_Supplier_Id),
      id: String(row.int_Supplier_Id),
      supplierId: row.int_Supplier_Id,
      code: row.txt_Supplier_Code,
      name: row.txt_Supplier_Name,
      contactPerson: row.txt_Contact_Person_Name,
      phone: row.txt_Contact_Number,
      email: row.txt_Email,
      address: row.txt_Address_Line1,
      city: row.txt_City,
      state: row.txt_State,
      country: row.txt_Country,
      pincode: row.txt_Pincode,
      gst: row.txt_GSTIN,
      pan: row.txt_PAN,
      rating: row.dec_Rating != null ? Number(row.dec_Rating) : 4.5,
      category: 'General Grocery',
      leadTimeDays: row.dec_Average_Lead_Time_Days != null ? Number(row.dec_Average_Lead_Time_Days) : (row.int_Lead_Time_Days || 2),
      paymentTerms: row.txt_Payment_Terms || 'Net 30',
      isPreferred: this.toBoolean(row.bit_Is_Preferred_Supplier),
      status: this.toBoolean(row.bit_IsActive) ? 'Active' : 'Inactive',
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async findByIdOrCode(identifier, connection = null) {
    const numericMatch = String(identifier).match(/\d+/);
    const numericId = numericMatch ? parseInt(numericMatch[0], 10) : (parseInt(identifier, 10) || null);
    const sql = `
      SELECT * FROM tbl_Supplier 
      WHERE (int_Supplier_Id = ? OR txt_Supplier_Code = ? OR LOWER(txt_Supplier_Name) = LOWER(?))
        AND bit_IsActive = 1 
      LIMIT 1
    `;
    const rows = await this.query(sql, [numericId || 0, identifier, identifier], connection);
    return rows[0] || null;
  }

  async createSupplier(data, user = 'system', connection = null) {
    const supId = data.int_Supplier_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(data, user);
    const sql = `
      INSERT INTO tbl_Supplier (
        int_Supplier_Id,
        txt_Supplier_Code,
        txt_Supplier_Name,
        txt_Contact_Person_Name,
        txt_Contact_Number,
        txt_Email,
        txt_Address_Line1,
        txt_City,
        txt_State,
        txt_Country,
        txt_Pincode,
        txt_GSTIN,
        txt_PAN,
        txt_Payment_Terms,
        int_Credit_Period_Days,
        dec_Credit_Limit,
        dec_Rating,
        bit_Is_Preferred_Supplier,
        dec_Average_Lead_Time_Days,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      supId,
      auditData.txt_Supplier_Code || `SUP-${String(supId).padStart(3, '0')}`,
      auditData.txt_Supplier_Name,
      auditData.txt_Contact_Person_Name || auditData.contactPerson || null,
      auditData.txt_Contact_Number || auditData.phone || '+91 98450 11223',
      auditData.txt_Email || auditData.email || null,
      auditData.txt_Address_Line1 || auditData.address || null,
      auditData.txt_City || auditData.city || 'Bangalore',
      auditData.txt_State || auditData.state || 'Karnataka',
      auditData.txt_Country || auditData.country || 'India',
      auditData.txt_Pincode || auditData.pincode || '560001',
      auditData.txt_GSTIN || auditData.gst || null,
      auditData.txt_PAN || auditData.pan || null,
      auditData.txt_Payment_Terms || auditData.paymentTerms || 'Net 30',
      auditData.int_Credit_Period_Days || 30,
      auditData.dec_Credit_Limit || 500000,
      auditData.dec_Rating != null ? auditData.dec_Rating : (auditData.rating || 4.5),
      auditData.bit_Is_Preferred_Supplier !== undefined ? (auditData.bit_Is_Preferred_Supplier ? 1 : 0) : 1,
      auditData.dec_Average_Lead_Time_Days != null ? auditData.dec_Average_Lead_Time_Days : (auditData.int_Lead_Time_Days || auditData.leadTimeDays || 2),
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Supplier_Id: supId };
  }

  async updateSupplier(id, data, user = 'system', connection = null) {
    const auditData = this.withAuditUpdate(data, user);
    const sql = `
      UPDATE tbl_Supplier
      SET txt_Supplier_Name = COALESCE(?, txt_Supplier_Name),
          txt_Contact_Person_Name = COALESCE(?, txt_Contact_Person_Name),
          txt_Contact_Number = COALESCE(?, txt_Contact_Number),
          txt_Email = COALESCE(?, txt_Email),
          txt_Address_Line1 = COALESCE(?, txt_Address_Line1),
          txt_City = COALESCE(?, txt_City),
          dec_Rating = COALESCE(?, dec_Rating),
          dte_Modified_Date = ?,
          txt_Modified_By = ?
      WHERE int_Supplier_Id = ?
    `;
    const params = [
      data.txt_Supplier_Name,
      data.txt_Contact_Person_Name || data.contactPerson,
      data.txt_Contact_Number || data.phone,
      data.txt_Email,
      data.txt_Address_Line1 || data.address,
      data.txt_City,
      data.dec_Rating,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      id,
    ];
    await this.execute(sql, params, connection);
    return await this.findById(id, connection);
  }
}

module.exports = new SupplierRepository();

