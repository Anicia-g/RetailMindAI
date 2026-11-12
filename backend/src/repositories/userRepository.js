const BaseRepository = require('./baseRepository');

class UserRepository extends BaseRepository {
  constructor() {
    super('tbl_User', 'int_User_Id');
  }

  /**
   * Serializes a relational user row to frontend DTO shape
   */
  toDTO(row) {
    if (!row) return null;
    const firstName = row.txt_First_Name || '';
    const lastName = row.txt_Last_Name || '';
    const name = `${firstName} ${lastName}`.trim() || row.txt_Username || row.txt_Email;
    const role = (row.role_code || row.role_name || row.txt_Role_Name || 'CUSTOMER').toUpperCase();
    
    // Generate role permissions array
    const permissions = [];
    if (row.bit_Can_Manage_Users) permissions.push('users:manage');
    if (row.bit_Can_Manage_Inventory) permissions.push('inventory:read', 'inventory:write');
    if (row.bit_Can_Manage_Sales) permissions.push('sales', 'orders');
    if (row.bit_Can_Manage_Purchase) permissions.push('purchases', 'suppliers');
    if (row.bit_Can_View_Reports) permissions.push('reports');
    if (row.bit_Can_Manage_Settings) permissions.push('settings');
    if (role === 'ADMIN') permissions.push('all');
    if (role === 'CUSTOMER') permissions.push('shop', 'cart', 'orders:read', 'recommendations');

    const storeId = row.int_Store_Id ? `store-${String(row.int_Store_Id).padStart(2, '0')}` : (role === 'SELLER' ? 'store-01' : null);
    const store = row.txt_Store_Name || (role === 'SELLER' ? 'Indiranagar Flagship (Store 01)' : 'Headquarters (HQ)');

    return {
      _id: String(row.int_User_Id),
      id: String(row.int_User_Id),
      userId: row.int_User_Id,
      employeeCode: row.txt_Employee_Code,
      name,
      firstName,
      lastName,
      username: row.txt_Username,
      email: row.txt_Email,
      phone: row.txt_Phone_Number,
      role,
      roleId: row.int_Role_Id,
      storeId,
      store,
      internalStoreId: row.int_Store_Id,
      permissions: permissions.length > 0 ? permissions : (role === 'ADMIN' ? ['all'] : role === 'SELLER' ? ['sales', 'orders'] : ['shop']),
      avatar: name.slice(0, 2).toUpperCase() || 'RM',
      image: row.txt_Profile_Image_Url || null,
      isLocked: this.toBoolean(row.bit_Is_Locked),
      failedAttempts: row.int_Failed_Login_Attempts || 0,
      lastLogin: row.dte_Last_Login_Date,
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async findByEmail(email, connection = null) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    const sql = `
      SELECT 
        u.*,
        r.txt_Role_Name AS role_name,
        r.txt_Role_Code AS role_code,
        r.bit_Can_Manage_Users,
        r.bit_Can_Manage_Inventory,
        r.bit_Can_Manage_Sales,
        r.bit_Can_Manage_Purchase,
        r.bit_Can_View_Reports,
        r.bit_Can_Manage_Settings,
        s.txt_Store_Name,
        s.txt_Store_Code
      FROM tbl_User u
      LEFT JOIN tbl_Role r ON u.int_Role_Id = r.int_Role_Id
      LEFT JOIN tbl_Store s ON u.int_Store_Id = s.int_Store_Id
      WHERE LOWER(u.txt_Email) = ?
      LIMIT 1
    `;
    const rows = await this.query(sql, [normalized], connection);
    return rows[0] || null;
  }

  async findById(id, connection = null) {
    if (!id) return null;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;

    const sql = `
      SELECT 
        u.*,
        r.txt_Role_Name AS role_name,
        r.txt_Role_Code AS role_code,
        r.bit_Can_Manage_Users,
        r.bit_Can_Manage_Inventory,
        r.bit_Can_Manage_Sales,
        r.bit_Can_Manage_Purchase,
        r.bit_Can_View_Reports,
        r.bit_Can_Manage_Settings,
        s.txt_Store_Name,
        s.txt_Store_Code
      FROM tbl_User u
      LEFT JOIN tbl_Role r ON u.int_Role_Id = r.int_Role_Id
      LEFT JOIN tbl_Store s ON u.int_Store_Id = s.int_Store_Id
      WHERE u.int_User_Id = ?
      LIMIT 1
    `;
    const rows = await this.query(sql, [numericId], connection);
    return rows[0] || null;
  }

  async createUser(userData, user = 'system', connection = null) {
    const userId = userData.int_User_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(userData, user);
    const sql = `
      INSERT INTO tbl_User (
        int_User_Id,
        txt_Employee_Code,
        txt_First_Name,
        txt_Last_Name,
        txt_Email,
        txt_Phone_Number,
        txt_Password_Hash,
        txt_Username,
        int_Role_Id,
        int_Store_Id,
        txt_Profile_Image_Url,
        dte_Date_Of_Birth,
        txt_Gender,
        dte_Date_Of_Joining,
        dte_Date_Of_Leaving,
        bit_Is_Locked,
        int_Failed_Login_Attempts,
        dte_Last_Login_Date,
        txt_Emergency_Contact_Number,
        txt_National_Id_Number,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userId,
      auditData.txt_Employee_Code,
      auditData.txt_First_Name,
      auditData.txt_Last_Name,
      auditData.txt_Email.toLowerCase(),
      auditData.txt_Phone_Number || '',
      auditData.txt_Password_Hash,
      auditData.txt_Username,
      auditData.int_Role_Id,
      auditData.int_Store_Id || null,
      auditData.txt_Profile_Image_Url || null,
      auditData.dte_Date_Of_Birth ? this.formatDate(auditData.dte_Date_Of_Birth) : null,
      auditData.txt_Gender || null,
      auditData.dte_Date_Of_Joining ? this.formatDate(auditData.dte_Date_Of_Joining) : this.formatDate(new Date()),
      auditData.dte_Date_Of_Leaving ? this.formatDate(auditData.dte_Date_Of_Leaving) : null,
      auditData.bit_Is_Locked ? 1 : 0,
      auditData.int_Failed_Login_Attempts || 0,
      auditData.dte_Last_Login_Date ? this.formatDateTime(auditData.dte_Last_Login_Date) : null,
      auditData.txt_Emergency_Contact_Number || null,
      auditData.txt_National_Id_Number || null,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_User_Id: userId };
  }

  async updateLastLogin(userId, connection = null) {
    const now = this.formatDateTime(new Date());
    const sql = `
      UPDATE tbl_User
      SET dte_Last_Login_Date = ?,
          int_Failed_Login_Attempts = 0,
          dte_Modified_Date = ?,
          txt_Modified_By = 'authService'
      WHERE int_User_Id = ?
    `;
    await this.execute(sql, [now, now, userId], connection);
  }

  async recordFailedLogin(userId, connection = null) {
    const now = this.formatDateTime(new Date());
    const sql = `
      UPDATE tbl_User
      SET int_Failed_Login_Attempts = int_Failed_Login_Attempts + 1,
          bit_Is_Locked = CASE WHEN int_Failed_Login_Attempts >= 4 THEN 1 ELSE bit_Is_Locked END,
          dte_Modified_Date = ?,
          txt_Modified_By = 'authService'
      WHERE int_User_Id = ?
    `;
    await this.execute(sql, [now, userId], connection);
  }

  async updatePassword(userId, passwordHash, user = 'system', connection = null) {
    const now = this.formatDateTime(new Date());
    const username = typeof user === 'string' ? user : user?.name || 'system';
    const sql = `
      UPDATE tbl_User
      SET txt_Password_Hash = ?,
          dte_Modified_Date = ?,
          txt_Modified_By = ?
      WHERE int_User_Id = ?
    `;
    await this.execute(sql, [passwordHash, now, username, userId], connection);
  }

  async findAllSellers(connection = null) {
    const sql = `
      SELECT 
        u.*,
        r.txt_Role_Name AS role_name,
        r.txt_Role_Code AS role_code,
        s.txt_Store_Name,
        s.txt_Store_Code
      FROM tbl_User u
      JOIN tbl_Role r ON u.int_Role_Id = r.int_Role_Id
      LEFT JOIN tbl_Store s ON u.int_Store_Id = s.int_Store_Id
      WHERE r.txt_Role_Code IN ('SELLER', 'MANAGER') AND u.bit_IsActive = 1
      ORDER BY u.txt_First_Name ASC
    `;
    const rows = await this.query(sql, [], connection);
    return rows.map((r) => this.toDTO(r));
  }
}

module.exports = new UserRepository();
