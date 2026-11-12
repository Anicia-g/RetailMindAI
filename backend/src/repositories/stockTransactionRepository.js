const BaseRepository = require('./baseRepository');

class StockTransactionRepository extends BaseRepository {
  constructor() {
    super('tbl_Stock_Transaction', 'int_Stock_Transaction_Id');
  }

  toDTO(row) {
    if (!row) return null;
    const txIdStr = `stx-${String(row.int_Stock_Transaction_Id).padStart(4, '0')}`;
    const prodIdStr = `prod-${String(row.int_Product_Id).padStart(3, '0')}`;
    return {
      _id: String(row.int_Stock_Transaction_Id),
      id: String(row.int_Stock_Transaction_Id),
      transactionId: txIdStr,
      productId: prodIdStr,
      sku: row.txt_SKU || `SKU-${row.int_Product_Id}`,
      productName: row.txt_Product_Name || 'Product',
      storeId: row.int_Store_Id ? `store-${String(row.int_Store_Id).padStart(2, '0')}` : 'store-01',
      type: row.txt_Transaction_Type,
      quantity: Number(row.int_Quantity || 0),
      referenceNumber: row.txt_Reference_Number,
      referenceId: row.txt_Reference_Number || String(row.int_Reference_Id || ''),
      performedBy: row.user_name || row.txt_Created_By || 'System',
      reason: row.txt_Remarks || row.txt_Transaction_Type,
      timestamp: row.dte_Transaction_Date || row.dte_Created_Date,
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async createTransaction({
    productId,
    storeId = 1,
    type = 'ADJUSTMENT',
    quantity,
    referenceNumber = null,
    referenceType = 'POS',
    referenceId = null,
    unitCost = 0,
    performedByUserId = 1,
    remarks = '',
    user = 'system',
  }, connection = null) {
    const txId = await this.getNextId(connection);
    const auditData = this.withAuditInsert(
      {
        int_Stock_Transaction_Id: txId,
        int_Product_Id: productId,
        int_Store_Id: storeId || 1,
        txt_Transaction_Type: type,
        int_Quantity: quantity,
        txt_Reference_Number: referenceNumber || `TX-${txId}`,
        txt_Reference_Type: referenceType,
        int_Reference_Id: referenceId ? (parseInt(referenceId, 10) || null) : null,
        dec_Unit_Cost: unitCost || 0,
        dte_Transaction_Date: this.formatDateTime(new Date()),
        int_Performed_By_User_Id: performedByUserId || 1,
        txt_Remarks: remarks,
        dec_Total_Value: Math.abs(quantity * (unitCost || 0)),
      },
      user
    );

    const sql = `
      INSERT INTO tbl_Stock_Transaction (
        int_Stock_Transaction_Id,
        int_Product_Id,
        int_Store_Id,
        txt_Transaction_Type,
        int_Quantity,
        txt_Reference_Number,
        txt_Reference_Type,
        int_Reference_Id,
        dec_Unit_Cost,
        dte_Transaction_Date,
        int_Performed_By_User_Id,
        txt_Remarks,
        dec_Total_Value,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      txId,
      auditData.int_Product_Id,
      auditData.int_Store_Id,
      auditData.txt_Transaction_Type,
      auditData.int_Quantity,
      auditData.txt_Reference_Number,
      auditData.txt_Reference_Type,
      auditData.int_Reference_Id,
      auditData.dec_Unit_Cost,
      auditData.dte_Transaction_Date,
      auditData.int_Performed_By_User_Id,
      auditData.txt_Remarks,
      auditData.dec_Total_Value,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Stock_Transaction_Id: txId };
  }

  async findAllTransactions(filters = {}, connection = null) {
    let sql = `
      SELECT 
        st.*,
        p.txt_Product_Name,
        p.txt_SKU,
        CONCAT(u.txt_First_Name, ' ', u.txt_Last_Name) AS user_name
      FROM tbl_Stock_Transaction st
      JOIN tbl_Product p ON st.int_Product_Id = p.int_Product_Id
      LEFT JOIN tbl_User u ON st.int_Performed_By_User_Id = u.int_User_Id
      WHERE st.bit_IsActive = 1
    `;
    const params = [];

    if (filters.productId) {
      const prodNum = parseInt(String(filters.productId).replace(/\D/g, ''), 10) || 0;
      sql += ` AND (st.int_Product_Id = ? OR p.txt_SKU = ?)`;
      params.push(prodNum, filters.productId);
    }

    if (filters.type && filters.type !== 'All') {
      sql += ` AND st.txt_Transaction_Type = ?`;
      params.push(filters.type);
    }

    if (filters.storeId && filters.storeId !== 'All') {
      const storeNum = parseInt(String(filters.storeId).replace(/\D/g, ''), 10) || 1;
      sql += ` AND st.int_Store_Id = ?`;
      params.push(storeNum);
    }

    sql += ` ORDER BY st.dte_Transaction_Date DESC LIMIT 100`;
    const rows = await this.query(sql, params, connection);
    return rows.map((r) => this.toDTO(r));
  }
}

module.exports = new StockTransactionRepository();
