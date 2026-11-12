const BaseRepository = require('./baseRepository');

class CustomerRepository extends BaseRepository {
  constructor() {
    super('tbl_Customer', 'int_Customer_Id');
  }

  toDTO(row) {
    if (!row) return null;
    const custIdStr = `cust-${String(row.int_Customer_Id).padStart(3, '0')}`;
    const name = `${row.txt_First_Name || ''} ${row.txt_Last_Name || ''}`.trim() || row.txt_Customer_Code;
    const totalSpent = Number(row.dec_Total_Purchase_Amount || 0);
    const loyaltyPoints = Number(row.int_Loyalty_Points || 0);

    let tier = 'BRONZE';
    if (totalSpent > 25000 || loyaltyPoints > 1000) tier = 'PLATINUM';
    else if (totalSpent > 10000 || loyaltyPoints > 500) tier = 'GOLD';
    else if (totalSpent > 3000 || loyaltyPoints > 100) tier = 'SILVER';

    let preferences = {
      whatsappOffers: true,
      emailUpdates: true,
      smsNotifications: false,
    };
    if (row.txt_Communication_Preference) {
      try {
        preferences = JSON.parse(row.txt_Communication_Preference);
      } catch (e) {
        preferences.whatsappOffers = row.txt_Communication_Preference !== 'OPT_OUT';
      }
    }

    return {
      _id: String(row.int_Customer_Id),
      id: String(row.int_Customer_Id),
      customerId: custIdStr,
      code: row.txt_Customer_Code,
      name,
      firstName: row.txt_First_Name,
      lastName: row.txt_Last_Name,
      email: row.txt_Email,
      phone: row.txt_Phone_Number,
      address: `${row.txt_Address_Line1 || ''}${row.txt_City ? ', ' + row.txt_City : ''}`,
      city: row.txt_City,
      state: row.txt_State,
      totalSpent,
      orders: row.order_count ? Number(row.order_count) : (totalSpent > 0 ? Math.max(1, Math.round(totalSpent / 1200)) : 0),
      aov: totalSpent > 0 ? Math.round(totalSpent / Math.max(1, row.order_count || 1)) : 0,
      smartCoins: loyaltyPoints,
      loyaltyPoints,
      tier,
      isVip: this.toBoolean(row.bit_Is_VIP),
      registeredDate: row.dte_Registration_Date,
      lastPurchase: row.dte_Last_Purchase_Date ? String(row.dte_Last_Purchase_Date).slice(0, 10) : 'Never',
      preferences,
      status: this.toBoolean(row.bit_IsActive) ? 'Active' : 'Inactive',
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async findByEmailOrPhone(identifier, connection = null) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    const sql = `
      SELECT * FROM tbl_Customer 
      WHERE (LOWER(txt_Email) = ? OR txt_Phone_Number = ? OR txt_Customer_Code = ?)
        AND bit_IsActive = 1 
      LIMIT 1
    `;
    const rows = await this.query(sql, [clean, clean, clean], connection);
    return rows[0] || null;
  }

  async findByIdOrCode(identifier, connection = null) {
    if (!identifier) return null;
    const numericMatch = String(identifier).match(/\d+/);
    const numericId = numericMatch ? parseInt(numericMatch[0], 10) : (parseInt(identifier, 10) || null);
    const sql = `
      SELECT * FROM tbl_Customer 
      WHERE (int_Customer_Id = ? OR txt_Customer_Code = ? OR LOWER(txt_Email) = LOWER(?))
        AND bit_IsActive = 1 
      LIMIT 1
    `;
    const rows = await this.query(sql, [numericId || 0, identifier, identifier], connection);
    return rows[0] || null;
  }

  async createCustomer(data, user = 'system', connection = null) {
    const custId = data.int_Customer_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(data, user);
    const sql = `
      INSERT INTO tbl_Customer (
        int_Customer_Id,
        txt_Customer_Code,
        txt_First_Name,
        txt_Last_Name,
        txt_Email,
        txt_Phone_Number,
        txt_Address_Line1,
        txt_Address_Line2,
        txt_City,
        txt_State,
        txt_Country,
        txt_Pincode,
        dte_Date_Of_Birth,
        txt_Gender,
        txt_Customer_Type,
        int_Preferred_Store_Id,
        int_Loyalty_Points,
        dec_Total_Purchase_Amount,
        dte_Registration_Date,
        dte_Last_Purchase_Date,
        bit_Is_VIP,
        txt_Referral_Source,
        txt_Communication_Preference,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      custId,
      auditData.txt_Customer_Code || `CUST-${String(custId).padStart(4, '0')}`,
      auditData.txt_First_Name || 'Customer',
      auditData.txt_Last_Name || null,
      auditData.txt_Email || null,
      auditData.txt_Phone_Number || '+91 98450 11234',
      auditData.txt_Address_Line1 || null,
      auditData.txt_Address_Line2 || null,
      auditData.txt_City || 'Bangalore',
      auditData.txt_State || 'Karnataka',
      auditData.txt_Country || 'India',
      auditData.txt_Pincode || '560038',
      auditData.dte_Date_Of_Birth ? this.formatDate(auditData.dte_Date_Of_Birth) : null,
      auditData.txt_Gender || null,
      auditData.txt_Customer_Type || 'Retail Regular',
      auditData.int_Preferred_Store_Id || 1,
      auditData.int_Loyalty_Points || 0,
      auditData.dec_Total_Purchase_Amount || 0,
      auditData.dte_Registration_Date ? this.formatDate(auditData.dte_Registration_Date) : this.formatDate(new Date()),
      auditData.dte_Last_Purchase_Date ? this.formatDateTime(auditData.dte_Last_Purchase_Date) : null,
      auditData.bit_Is_VIP ? 1 : 0,
      auditData.txt_Referral_Source || 'Storefront Walkin',
      auditData.txt_Communication_Preference ? (typeof auditData.txt_Communication_Preference === 'object' ? JSON.stringify(auditData.txt_Communication_Preference) : auditData.txt_Communication_Preference) : null,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Customer_Id: custId };
  }

  async updatePreferences(id, preferences, user = 'system', connection = null) {
    const now = this.formatDateTime(new Date());
    const prefJson = typeof preferences === 'object' ? JSON.stringify(preferences) : preferences;
    const sql = `
      UPDATE tbl_Customer
      SET txt_Communication_Preference = ?,
          dte_Modified_Date = ?,
          txt_Modified_By = ?
      WHERE int_Customer_Id = ?
    `;
    await this.execute(sql, [prefJson, now, user, id], connection);
  }

  async updateCustomerStats(customerId, totalAmount, connection = null) {
    const now = this.formatDateTime(new Date());
    const loyaltyDelta = Math.floor(totalAmount * 0.05);
    const sql = `
      UPDATE tbl_Customer
      SET dec_Total_Purchase_Amount = COALESCE(dec_Total_Purchase_Amount, 0) + ?,
          int_Loyalty_Points = COALESCE(int_Loyalty_Points, 0) + ?,
          dte_Last_Purchase_Date = ?,
          dte_Modified_Date = ?,
          txt_Modified_By = 'posService'
      WHERE int_Customer_Id = ?
    `;
    await this.execute(sql, [totalAmount, loyaltyDelta, now, now, customerId], connection);
  }
}

module.exports = new CustomerRepository();
