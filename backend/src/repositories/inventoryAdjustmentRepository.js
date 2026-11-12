const BaseRepository = require('./baseRepository');

class InventoryAdjustmentRepository extends BaseRepository {
  constructor() {
    super('tbl_Inventory_Adjustment', 'int_Adjustment_Id');
  }

  toDTO(row) {
    if (!row) return null;
    return {
      _id: String(row.int_Adjustment_Id),
      id: String(row.int_Adjustment_Id),
      adjustmentId: row.int_Adjustment_Id,
      adjustmentNumber: row.txt_Adjustment_Number,
      inventoryId: row.int_Inventory_Id,
      productId: row.int_Product_Id,
      storeId: row.int_Store_Id,
      warehouseId: row.int_Warehouse_Id,
      userId: row.int_User_Id,
      quantityBefore: Number(row.int_Quantity_Before || 0),
      quantityAdjusted: Number(row.int_Quantity_Adjusted || 0),
      quantityAfter: Number(row.int_Quantity_After || 0),
      type: row.txt_Adjustment_Type,
      reason: row.txt_Reason,
      adjustmentDate: row.dte_Adjustment_Date,
      createdAt: row.dte_Created_Date,
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async createAdjustment({
    adjustmentNumber = null,
    inventoryId = null,
    storeId = 1,
    warehouseId = 1,
    productId,
    type = 'COUNT',
    reason = 'Stock cycle count correction',
    quantityBefore = 0,
    quantityAdjusted = 0,
    quantityAfter = 0,
    userId = 1,
    user = 'system',
  }, connection = null) {
    const adjId = await this.getNextId(connection);
    const adjNum = adjustmentNumber || `ADJ-${Date.now().toString().slice(-6)}`;
    const auditData = this.withAuditInsert(
      {
        int_Adjustment_Id: adjId,
        txt_Adjustment_Number: adjNum,
        int_Inventory_Id: inventoryId || null,
        int_Product_Id: productId,
        int_Store_Id: storeId || 1,
        int_Warehouse_Id: warehouseId || 1,
        int_User_Id: userId || 1,
        int_Quantity_Before: quantityBefore,
        int_Quantity_Adjusted: quantityAdjusted,
        int_Quantity_After: quantityAfter,
        txt_Adjustment_Type: type,
        txt_Reason: reason,
        dte_Adjustment_Date: this.formatDateTime(new Date()),
      },
      user
    );

    const sql = `
      INSERT INTO tbl_Inventory_Adjustment (
        int_Adjustment_Id,
        txt_Adjustment_Number,
        int_Inventory_Id,
        int_Product_Id,
        int_Store_Id,
        int_Warehouse_Id,
        int_User_Id,
        int_Quantity_Before,
        int_Quantity_Adjusted,
        int_Quantity_After,
        txt_Adjustment_Type,
        txt_Reason,
        dte_Adjustment_Date,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      adjId,
      auditData.txt_Adjustment_Number,
      auditData.int_Inventory_Id,
      auditData.int_Product_Id,
      auditData.int_Store_Id,
      auditData.int_Warehouse_Id,
      auditData.int_User_Id,
      auditData.int_Quantity_Before,
      auditData.int_Quantity_Adjusted,
      auditData.int_Quantity_After,
      auditData.txt_Adjustment_Type,
      auditData.txt_Reason,
      auditData.dte_Adjustment_Date,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Adjustment_Id: adjId };
  }
}

module.exports = new InventoryAdjustmentRepository();
