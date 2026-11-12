const BaseRepository = require('./baseRepository');

class RoleRepository extends BaseRepository {
  constructor() {
    super('tbl_Role', 'int_Role_Id');
  }

  toDTO(row) {
    if (!row) return null;
    return {
      _id: String(row.int_Role_Id),
      id: String(row.int_Role_Id),
      roleId: row.int_Role_Id,
      code: row.txt_Role_Code,
      name: row.txt_Role_Name,
      description: row.txt_Role_Description || row.txt_Description,
      isSystemRole: this.toBoolean(row.bit_Is_System_Role),
      canManageUsers: this.toBoolean(row.bit_Can_Manage_Users),
      canManageInventory: this.toBoolean(row.bit_Can_Manage_Inventory),
      canManageSales: this.toBoolean(row.bit_Can_Manage_Sales),
      canManagePurchase: this.toBoolean(row.bit_Can_Manage_Purchase),
      canViewReports: this.toBoolean(row.bit_Can_View_Reports),
      canManageSettings: this.toBoolean(row.bit_Can_Manage_Settings),
      accessLevel: row.int_Access_Level || 10,
      canApprovePurchaseOrders: this.toBoolean(row.bit_Can_Approve_Purchase_Orders),
      canViewFinancialData: this.toBoolean(row.bit_Can_View_Financial_Data),
      canManageCustomers: this.toBoolean(row.bit_Can_Manage_Customers),
      canManageSuppliers: this.toBoolean(row.bit_Can_Manage_Suppliers),
      canExportData: this.toBoolean(row.bit_Can_Export_Data),
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async findByCode(roleCode, connection = null) {
    const sql = `
      SELECT * FROM tbl_Role 
      WHERE (txt_Role_Code = ? OR txt_Role_Name = ?) 
        AND bit_IsActive = 1 
      LIMIT 1
    `;
    const rows = await this.query(sql, [roleCode, roleCode], connection);
    return rows[0] || null;
  }

  async createRole(data, user = 'system', connection = null) {
    const roleId = data.int_Role_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(data, user);
    const sql = `
      INSERT INTO tbl_Role (
        int_Role_Id,
        txt_Role_Code,
        txt_Role_Name,
        txt_Role_Description,
        bit_Is_System_Role,
        bit_Can_Manage_Users,
        bit_Can_Manage_Inventory,
        bit_Can_Manage_Sales,
        bit_Can_Manage_Purchase,
        bit_Can_View_Reports,
        bit_Can_Manage_Settings,
        int_Access_Level,
        bit_Can_Approve_Purchase_Orders,
        bit_Can_View_Financial_Data,
        bit_Can_Manage_Customers,
        bit_Can_Manage_Suppliers,
        bit_Can_Export_Data,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      roleId,
      auditData.txt_Role_Code,
      auditData.txt_Role_Name,
      auditData.txt_Role_Description || null,
      auditData.bit_Is_System_Role ? 1 : 0,
      auditData.bit_Can_Manage_Users ? 1 : 0,
      auditData.bit_Can_Manage_Inventory ? 1 : 0,
      auditData.bit_Can_Manage_Sales ? 1 : 0,
      auditData.bit_Can_Manage_Purchase ? 1 : 0,
      auditData.bit_Can_View_Reports ? 1 : 0,
      auditData.bit_Can_Manage_Settings ? 1 : 0,
      auditData.int_Access_Level || 10,
      auditData.bit_Can_Approve_Purchase_Orders ? 1 : 0,
      auditData.bit_Can_View_Financial_Data ? 1 : 0,
      auditData.bit_Can_Manage_Customers ? 1 : 0,
      auditData.bit_Can_Manage_Suppliers ? 1 : 0,
      auditData.bit_Can_Export_Data ? 1 : 0,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];
    await this.execute(sql, params, connection);
    return { ...auditData, int_Role_Id: roleId };
  }
}

module.exports = new RoleRepository();
