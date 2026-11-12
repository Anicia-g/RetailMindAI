const BaseRepository = require('./baseRepository');

class StockTransferRepository extends BaseRepository {
  constructor() {
    super('tbl_Stock_Transfer', 'int_Transfer_Id');
  }

  toDTO(row) {
    if (!row) return null;
    return {
      _id: String(row.int_Transfer_Id),
      id: String(row.int_Transfer_Id),
      transferId: row.int_Transfer_Id,
      transferNumber: row.txt_Transfer_Number,
      sourceStoreId: row.int_Source_Store_Id,
      destStoreId: row.int_Dest_Store_Id,
      sourceWarehouseId: row.int_Source_Warehouse_Id,
      destWarehouseId: row.int_Dest_Warehouse_Id,
      userId: row.int_User_Id,
      transferDate: row.dte_Transfer_Date,
      status: row.txt_Transfer_Status,
      createdAt: row.dte_Created_Date,
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async createTransfer({
    transferNumber = null,
    sourceStoreId = null,
    destStoreId = null,
    destinationStoreId = null,
    sourceWarehouseId = 1,
    destWarehouseId = 1,
    destinationWarehouseId = 1,
    userId = 1,
    requestedByUserId = 1,
    status = 'COMPLETED',
    user = 'system',
  }, connection = null) {
    const transferId = await this.getNextId(connection);
    const txNum = transferNumber || `TRF-${Date.now().toString().slice(-6)}`;
    const auditData = this.withAuditInsert(
      {
        int_Transfer_Id: transferId,
        txt_Transfer_Number: txNum,
        int_Source_Store_Id: sourceStoreId || 1,
        int_Dest_Store_Id: destStoreId || destinationStoreId || 2,
        int_Source_Warehouse_Id: sourceWarehouseId || 1,
        int_Dest_Warehouse_Id: destWarehouseId || destinationWarehouseId || 1,
        int_User_Id: userId || requestedByUserId || 1,
        dte_Transfer_Date: this.formatDateTime(new Date()),
        txt_Transfer_Status: status || 'COMPLETED',
      },
      user
    );

    const sql = `
      INSERT INTO tbl_Stock_Transfer (
        int_Transfer_Id,
        txt_Transfer_Number,
        int_Source_Store_Id,
        int_Dest_Store_Id,
        int_Source_Warehouse_Id,
        int_Dest_Warehouse_Id,
        int_User_Id,
        dte_Transfer_Date,
        txt_Transfer_Status,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      transferId,
      auditData.txt_Transfer_Number,
      auditData.int_Source_Store_Id,
      auditData.int_Dest_Store_Id,
      auditData.int_Source_Warehouse_Id,
      auditData.int_Dest_Warehouse_Id,
      auditData.int_User_Id,
      auditData.dte_Transfer_Date,
      auditData.txt_Transfer_Status,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Transfer_Id: transferId };
  }

  /**
   * Processes a multi-item stock transfer inside an ACID transaction.
   * Atomically creates tbl_Stock_Transfer, tbl_Stock_Transfer_Item rows,
   * decrements source inventory, logs source TRANSFER_OUT,
   * increments destination inventory, and logs destination TRANSFER_IN.
   */
  async processTransferTransaction({
    transferNumber = null,
    sourceStoreId = 1,
    destStoreId = 2,
    sourceWarehouseId = null,
    destWarehouseId = null,
    userId = 1,
    items = [],
    remarks = '',
    user = 'system',
  }) {
    const { withTransaction } = require('../config/db');
    const inventoryRepository = require('./inventoryRepository');
    const stockTransactionRepository = require('./stockTransactionRepository');

    if (!items || items.length === 0) {
      throw new Error('Cannot process stock transfer: items array is empty.');
    }

    return await withTransaction(async (conn) => {
      // 1. Create Transfer Header
      const createdTransfer = await this.createTransfer(
        {
          transferNumber,
          sourceStoreId,
          destStoreId,
          sourceWarehouseId,
          destWarehouseId,
          userId,
          status: 'COMPLETED',
          user,
        },
        conn
      );

      const transferId = createdTransfer.int_Transfer_Id;
      const createdItems = [];

      // 2. Process Line Items + Dual-Store Restock + Double-Entry Ledgers
      for (const item of items) {
        const pId = item.productId || item.int_Product_Id || item.id;
        const qty = Number(item.quantity || item.quantityRequested || item.qty || 1);

        const [trfItemResult] = await conn.query(
          `INSERT INTO tbl_Stock_Transfer_Item (
            int_Transfer_Id, int_Product_Id, int_Quantity_Requested, int_Quantity_Sent, int_Quantity_Received,
            dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
          ) VALUES (?, ?, ?, ?, ?, NOW(), ?, NOW(), ?, 1)`,
          [
            transferId,
            pId,
            qty,
            qty,
            qty,
            user,
            user,
          ]
        );

        createdItems.push({
          transferItemId: trfItemResult.insertId,
          productId: pId,
          quantity: qty,
        });

        // 3. Deduct Source Inventory
        const srcInv = await inventoryRepository.findByProductAndStore(pId, sourceStoreId, conn);
        const srcCurrent = srcInv ? Number(srcInv.int_Quantity_On_Hand) : 0;
        if (srcCurrent < qty) {
          throw new Error(`Insufficient inventory at source store #${sourceStoreId} for product #${pId} (Available: ${srcCurrent}, Requested: ${qty})`);
        }
        await inventoryRepository.upsertStock(pId, sourceStoreId, srcCurrent - qty, user, conn);

        // 4. Source Stock Transaction (TRANSFER_OUT)
        await stockTransactionRepository.createTransaction(
          {
            productId: pId,
            storeId: sourceStoreId,
            type: 'TRANSFER_OUT',
            quantity: -qty,
            referenceNumber: createdTransfer.txt_Transfer_Number,
            referenceType: 'TRANSFER',
            referenceId: transferId,
            performedByUserId: userId,
            remarks: `Transfer OUT to Store #${destStoreId} - ${remarks}`,
            user,
          },
          conn
        );

        // 5. Increment Destination Inventory
        const destInv = await inventoryRepository.findByProductAndStore(pId, destStoreId, conn);
        const destCurrent = destInv ? Number(destInv.int_Quantity_On_Hand) : 0;
        await inventoryRepository.upsertStock(pId, destStoreId, destCurrent + qty, user, conn);

        // 6. Destination Stock Transaction (TRANSFER_IN)
        await stockTransactionRepository.createTransaction(
          {
            productId: pId,
            storeId: destStoreId,
            type: 'TRANSFER_IN',
            quantity: qty,
            referenceNumber: createdTransfer.txt_Transfer_Number,
            referenceType: 'TRANSFER',
            referenceId: transferId,
            performedByUserId: userId,
            remarks: `Transfer IN from Store #${sourceStoreId} - ${remarks}`,
            user,
          },
          conn
        );
      }

      return {
        ...createdTransfer,
        items: createdItems,
      };
    });
  }
}

module.exports = new StockTransferRepository();
