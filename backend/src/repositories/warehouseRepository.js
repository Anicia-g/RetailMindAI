const BaseRepository = require('./baseRepository');

class WarehouseRepository extends BaseRepository {
  constructor() {
    super('tbl_Warehouse', 'int_Warehouse_Id');
  }

  async findByCode(code, connection = null) {
    const sql = `SELECT * FROM tbl_Warehouse WHERE txt_Warehouse_Code = ? AND bit_IsActive = 1 LIMIT 1`;
    const rows = await this.query(sql, [code], connection);
    return rows[0] || null;
  }

  async createWarehouse(data, user = 'system', connection = null) {
    const whId = data.int_Warehouse_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(data, user);
    const sql = `
      INSERT INTO tbl_Warehouse (
        int_Warehouse_Id,
        txt_Warehouse_Code,
        txt_Warehouse_Name,
        int_Store_Id,
        txt_Address_Line1,
        txt_City,
        txt_State,
        txt_Country,
        txt_Pincode,
        txt_Contact_Number,
        dec_Storage_Capacity_Sqft,
        txt_Warehouse_Type,
        int_Manager_User_Id,
        bit_Is_Climate_Controlled,
        txt_Warehouse_Manager_Contact,
        int_Total_Rack_Count,
        bit_Is_Active_For_Transfers,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      whId,
      auditData.txt_Warehouse_Code,
      auditData.txt_Warehouse_Name,
      auditData.int_Store_Id || null,
      auditData.txt_Address_Line1 || '',
      auditData.txt_City || 'Bangalore',
      auditData.txt_State || 'Karnataka',
      auditData.txt_Country || 'India',
      auditData.txt_Pincode || '560038',
      auditData.txt_Contact_Number || null,
      auditData.dec_Storage_Capacity_Sqft || 10000,
      auditData.txt_Warehouse_Type || 'Regional DC',
      auditData.int_Manager_User_Id || null,
      auditData.bit_Is_Climate_Controlled ? 1 : 1,
      auditData.txt_Warehouse_Manager_Contact || null,
      auditData.int_Total_Rack_Count || 100,
      auditData.bit_Is_Active_For_Transfers ? 1 : 1,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Warehouse_Id: whId };
  }
}

module.exports = new WarehouseRepository();
