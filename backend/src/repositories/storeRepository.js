const BaseRepository = require('./baseRepository');

class StoreRepository extends BaseRepository {
  constructor() {
    super('tbl_Store', 'int_Store_Id');
  }

  toDTO(row) {
    if (!row) return null;
    const storeIdStr = `store-${String(row.int_Store_Id).padStart(2, '0')}`;
    return {
      _id: String(row.int_Store_Id),
      id: String(row.int_Store_Id),
      storeId: storeIdStr,
      code: row.txt_Store_Code,
      name: row.txt_Store_Name,
      type: row.txt_Store_Type,
      address: `${row.txt_Address_Line1}${row.txt_Address_Line2 ? ', ' + row.txt_Address_Line2 : ''}, ${row.txt_City}, ${row.txt_State} ${row.txt_Pincode}`,
      addressLine1: row.txt_Address_Line1,
      addressLine2: row.txt_Address_Line2,
      city: row.txt_City,
      state: row.txt_State,
      country: row.txt_Country,
      pincode: row.txt_Pincode,
      phone: row.txt_Contact_Number,
      email: row.txt_Email,
      manager: row.txt_Manager_Name,
      managerUserId: row.int_Manager_User_Id,
      areaSqft: row.dec_Store_Area_Sqft,
      operatingHours: row.txt_Operating_Hours || '08:00 AM - 10:00 PM',
      isHeadOffice: this.toBoolean(row.bit_Is_Head_Office),
      isWarehouseAttached: this.toBoolean(row.bit_Is_Warehouse_Attached),
      status: this.toBoolean(row.bit_IsActive) ? 'Active' : 'Inactive',
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async findByCode(code, connection = null) {
    const sql = `SELECT * FROM tbl_Store WHERE txt_Store_Code = ? LIMIT 1`;
    const rows = await this.query(sql, [code], connection);
    return rows[0] || null;
  }

  async findByIdOrCode(identifier, connection = null) {
    const numericMatch = String(identifier).match(/\d+/);
    const numericId = numericMatch ? parseInt(numericMatch[0], 10) : (parseInt(identifier, 10) || null);
    const sql = `
      SELECT * FROM tbl_Store 
      WHERE (int_Store_Id = ? OR txt_Store_Code = ? OR txt_Store_Name LIKE ?)
        AND bit_IsActive = 1 
      LIMIT 1
    `;
    const rows = await this.query(sql, [numericId || 0, identifier, `%${identifier}%`], connection);
    return rows[0] || null;
  }

  async createStore(data, user = 'system', connection = null) {
    const storeId = data.int_Store_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(data, user);
    const sql = `
      INSERT INTO tbl_Store (
        int_Store_Id,
        txt_Store_Code,
        txt_Store_Name,
        txt_Store_Type,
        txt_Address_Line1,
        txt_Address_Line2,
        txt_City,
        txt_State,
        txt_Country,
        txt_Pincode,
        txt_Contact_Number,
        txt_Email,
        txt_Manager_Name,
        int_Manager_User_Id,
        dec_Store_Area_Sqft,
        dte_Opening_Date,
        txt_Operating_Hours,
        bit_Is_Warehouse_Attached,
        bit_Is_Head_Office,
        dec_Monthly_Rent,
        txt_Time_Zone,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      storeId,
      auditData.txt_Store_Code,
      auditData.txt_Store_Name,
      auditData.txt_Store_Type || 'Supermarket',
      auditData.txt_Address_Line1 || '',
      auditData.txt_Address_Line2 || null,
      auditData.txt_City || 'Bangalore',
      auditData.txt_State || 'Karnataka',
      auditData.txt_Country || 'India',
      auditData.txt_Pincode || '560038',
      auditData.txt_Contact_Number || '+91 80 2520 1100',
      auditData.txt_Email || null,
      auditData.txt_Manager_Name || null,
      auditData.int_Manager_User_Id || null,
      auditData.dec_Store_Area_Sqft || 4500,
      auditData.dte_Opening_Date ? this.formatDate(auditData.dte_Opening_Date) : this.formatDate(new Date()),
      auditData.txt_Operating_Hours || '08:00 AM - 10:00 PM',
      auditData.bit_Is_Warehouse_Attached ? 1 : 0,
      auditData.bit_Is_Head_Office ? 1 : 0,
      auditData.dec_Monthly_Rent || 0,
      auditData.txt_Time_Zone || 'Asia/Kolkata',
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Store_Id: storeId };
  }

  async updateStore(id, data, user = 'system', connection = null) {
    const auditData = this.withAuditUpdate(data, user);
    const sql = `
      UPDATE tbl_Store
      SET txt_Store_Name = COALESCE(?, txt_Store_Name),
          txt_Store_Type = COALESCE(?, txt_Store_Type),
          txt_Address_Line1 = COALESCE(?, txt_Address_Line1),
          txt_City = COALESCE(?, txt_City),
          txt_State = COALESCE(?, txt_State),
          txt_Pincode = COALESCE(?, txt_Pincode),
          txt_Contact_Number = COALESCE(?, txt_Contact_Number),
          txt_Email = COALESCE(?, txt_Email),
          txt_Manager_Name = COALESCE(?, txt_Manager_Name),
          int_Manager_User_Id = COALESCE(?, int_Manager_User_Id),
          dte_Modified_Date = ?,
          txt_Modified_By = ?
      WHERE int_Store_Id = ?
    `;
    const params = [
      data.txt_Store_Name,
      data.txt_Store_Type,
      data.txt_Address_Line1,
      data.txt_City,
      data.txt_State,
      data.txt_Pincode,
      data.txt_Contact_Number,
      data.txt_Email,
      data.txt_Manager_Name,
      data.int_Manager_User_Id,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      id,
    ];
    await this.execute(sql, params, connection);
    return await this.findById(id, connection);
  }
}

module.exports = new StoreRepository();
