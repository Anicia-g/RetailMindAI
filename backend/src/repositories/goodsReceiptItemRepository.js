const BaseRepository = require('./baseRepository');

class GoodsReceiptItemRepository extends BaseRepository {
  constructor() {
    super('tbl_Goods_Receipt_Item', 'int_Goods_Receipt_Item_Id');
  }

  toDTO(row) {
    if (!row) return null;
    return {
      _id: String(row.int_Goods_Receipt_Item_Id),
      id: String(row.int_Goods_Receipt_Item_Id),
      receiptItemId: row.int_Goods_Receipt_Item_Id,
      goodsReceiptId: row.int_Goods_Receipt_Id,
      purchaseOrderItemId: row.int_Purchase_Order_Item_Id,
      productId: row.int_Product_Id,
      receivedQuantity: Number(row.int_Received_Quantity || 0),
      acceptedQuantity: Number(row.int_Accepted_Quantity || 0),
      rejectedQuantity: Number(row.int_Rejected_Quantity || 0),
      batchNumber: row.txt_Batch_Number,
      expiryDate: row.dte_Expiry_Date,
      isQualityPassed: this.toBoolean(row.bit_Is_Quality_Passed),
      createdAt: row.dte_Created_Date,
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async createReceiptItem(data, user = 'system', connection = null) {
    const itemId = data.int_Goods_Receipt_Item_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(data, user);
    const sql = `
      INSERT INTO tbl_Goods_Receipt_Item (
        int_Goods_Receipt_Item_Id,
        int_Goods_Receipt_Id,
        int_Purchase_Order_Item_Id,
        int_Product_Id,
        int_Received_Quantity,
        int_Accepted_Quantity,
        int_Rejected_Quantity,
        txt_Batch_Number,
        dte_Expiry_Date,
        bit_Is_Quality_Passed,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      itemId,
      auditData.int_Goods_Receipt_Id,
      auditData.int_Purchase_Order_Item_Id || null,
      auditData.int_Product_Id,
      auditData.int_Received_Quantity || 0,
      auditData.int_Accepted_Quantity || 0,
      auditData.int_Rejected_Quantity || 0,
      auditData.txt_Batch_Number || null,
      auditData.dte_Expiry_Date ? this.formatDate(auditData.dte_Expiry_Date) : null,
      auditData.bit_Is_Quality_Passed ? 1 : 1,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Goods_Receipt_Item_Id: itemId };
  }
}

module.exports = new GoodsReceiptItemRepository();
