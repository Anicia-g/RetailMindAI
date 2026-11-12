const BaseRepository = require('./baseRepository');

class GoodsReceiptRepository extends BaseRepository {
  constructor() {
    super('tbl_Goods_Receipt', 'int_Goods_Receipt_Id');
  }

  async createReceipt({
    purchaseOrderId,
    warehouseId = 1,
    storeId = 1,
    receivedByUserId = 1,
    status = 'Completed',
    invoiceNumber = null,
    user = 'system',
  }, connection = null) {
    const grnId = await this.getNextId(connection);
    const grnNumber = `GRN-${Date.now().toString().slice(-6)}`;
    const auditData = this.withAuditInsert(
      {
        int_Goods_Receipt_Id: grnId,
        txt_GRN_Number: grnNumber,
        int_Purchase_Order_Id: purchaseOrderId,
        int_Warehouse_Id: warehouseId || 1,
        int_Store_Id: storeId || 1,
        int_Received_By_User_Id: receivedByUserId || 1,
        dte_Receipt_Date: this.formatDateTime(new Date()),
        txt_Receipt_Status: status,
        txt_Quality_Check_Status: 'PASSED',
        txt_Remarks: invoiceNumber ? `Invoice: ${invoiceNumber}` : 'Inspected and verified',
      },
      user
    );

    const sql = `
      INSERT INTO tbl_Goods_Receipt (
        int_Goods_Receipt_Id,
        txt_GRN_Number,
        int_Purchase_Order_Id,
        int_Warehouse_Id,
        int_Store_Id,
        int_Received_By_User_Id,
        dte_Receipt_Date,
        txt_Receipt_Status,
        txt_Quality_Check_Status,
        txt_Remarks,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      grnId,
      auditData.txt_GRN_Number,
      auditData.int_Purchase_Order_Id,
      auditData.int_Warehouse_Id,
      auditData.int_Store_Id,
      auditData.int_Received_By_User_Id,
      auditData.dte_Receipt_Date,
      auditData.txt_Receipt_Status,
      auditData.txt_Quality_Check_Status,
      auditData.txt_Remarks,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Goods_Receipt_Id: grnId };
  }
}

module.exports = new GoodsReceiptRepository();
