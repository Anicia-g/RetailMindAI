const BaseRepository = require('./baseRepository');

class ReturnRepository extends BaseRepository {
  constructor() {
    super('tbl_Return', 'int_Return_Id');
  }

  toDTO(row) {
    if (!row) return null;
    return {
      _id: String(row.int_Return_Id),
      id: String(row.int_Return_Id),
      returnId: row.int_Return_Id,
      returnNumber: row.txt_Return_Number,
      orderId: row.int_Order_Id,
      customerId: row.int_Customer_Id,
      userId: row.int_User_Id,
      storeId: row.int_Store_Id,
      returnDate: row.dte_Return_Date,
      refundAmount: Number(row.dec_Refund_Amount || 0),
      reason: row.txt_Return_Reason,
      status: row.txt_Return_Status,
      createdAt: row.dte_Created_Date,
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async createReturn({
    orderId = null,
    customerId = null,
    storeId = 1,
    userId = 1,
    processedByUserId = 1,
    reason = 'Customer return',
    refundAmount = 0,
    status = 'COMPLETED',
    user = 'system',
  }, connection = null) {
    const retId = await this.getNextId(connection);
    const retNum = `RET-${Date.now().toString().slice(-6)}`;
    const auditData = this.withAuditInsert(
      {
        int_Return_Id: retId,
        txt_Return_Number: retNum,
        int_Order_Id: orderId,
        int_Customer_Id: customerId,
        int_User_Id: userId || processedByUserId || 1,
        int_Store_Id: storeId,
        dte_Return_Date: this.formatDateTime(new Date()),
        dec_Refund_Amount: refundAmount,
        txt_Return_Reason: reason,
        txt_Return_Status: status || 'COMPLETED',
      },
      user
    );

    const sql = `
      INSERT INTO tbl_Return (
        int_Return_Id,
        txt_Return_Number,
        int_Order_Id,
        int_Customer_Id,
        int_User_Id,
        int_Store_Id,
        dte_Return_Date,
        dec_Refund_Amount,
        txt_Return_Reason,
        txt_Return_Status,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      retId,
      auditData.txt_Return_Number,
      auditData.int_Order_Id,
      auditData.int_Customer_Id,
      auditData.int_User_Id,
      auditData.int_Store_Id,
      auditData.dte_Return_Date,
      auditData.dec_Refund_Amount,
      auditData.txt_Return_Reason,
      auditData.txt_Return_Status,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Return_Id: retId };
  }

  /**
   * Processes a customer return inside an ACID transaction.
   * Atomically creates tbl_Return, tbl_Return_Item, restocks tbl_Inventory, and logs tbl_Stock_Transaction.
   */
  async processReturnTransaction({
    orderId,
    customerId = null,
    storeId = 1,
    userId = 1,
    reason = 'Customer return',
    refundAmount = 0,
    items = [],
    user = 'system',
  }) {
    const { withTransaction } = require('../config/db');
    const inventoryRepository = require('./inventoryRepository');
    const stockTransactionRepository = require('./stockTransactionRepository');

    return await withTransaction(async (conn) => {
      // 1. Create Return Header
      const createdReturn = await this.createReturn(
        {
          orderId,
          customerId,
          storeId,
          userId,
          reason,
          refundAmount,
          status: 'COMPLETED',
          user,
        },
        conn
      );

      const returnId = createdReturn.int_Return_Id;
      const createdItems = [];

      // 2. Process Line Items + Restock + Ledger
      for (const item of items) {
        const pId = item.productId || item.int_Product_Id || item.id;
        const qty = Number(item.quantity || item.quantityReturned || item.qty || 1);
        const refund = Number(item.refundAmount || item.price || 0);

        const [retItemResult] = await conn.query(
          `INSERT INTO tbl_Return_Item (
            int_Return_Id, int_Order_Item_Id, int_Product_Id, int_Quantity_Returned,
            dec_Refund_Amount, txt_Item_Condition, bit_Is_Restocked,
            dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
          ) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), ?, NOW(), ?, 1)`,
          [
            returnId,
            item.orderItemId || item.int_Order_Item_Id || null,
            pId,
            qty,
            refund,
            item.condition || 'Good / Resellable',
            user,
            user,
          ]
        );

        createdItems.push({
          returnItemId: retItemResult.insertId,
          productId: pId,
          quantity: qty,
          refundAmount: refund,
        });

        // 3. Restock inventory
        const existingStock = await inventoryRepository.findByProductAndStore(pId, storeId, conn);
        const currentQty = existingStock ? Number(existingStock.int_Quantity_On_Hand) : 0;
        const newQty = currentQty + qty;
        await inventoryRepository.upsertStock(pId, storeId, newQty, user, conn);

        // 4. Create Stock Transaction
        await stockTransactionRepository.createTransaction(
          {
            productId: pId,
            storeId,
            type: 'RETURN',
            quantity: qty,
            referenceNumber: createdReturn.txt_Return_Number,
            referenceType: 'RETURN',
            referenceId: returnId,
            performedByUserId: userId,
            remarks: `Customer Return: ${reason}`,
            user,
          },
          conn
        );
      }

      return {
        ...createdReturn,
        items: createdItems,
      };
    });
  }
}

module.exports = new ReturnRepository();
