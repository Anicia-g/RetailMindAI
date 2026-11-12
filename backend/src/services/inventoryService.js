const inventoryRepository = require('../repositories/inventoryRepository');
const productRepository = require('../repositories/productRepository');
const stockTransactionRepository = require('../repositories/stockTransactionRepository');
const inventoryAdjustmentRepository = require('../repositories/inventoryAdjustmentRepository');
const { withTransaction } = require('../config/db');

class InventoryService {
  async getAllInventory(filters = {}) {
    return await inventoryRepository.findAllInventory(filters);
  }

  async getInventoryById(id) {
    const inv = await inventoryRepository.findByProductAndStore(id);
    if (!inv) {
      const product = await productRepository.findProductById(id);
      if (product) {
        return inventoryRepository.toDTO({
          int_Inventory_Id: product.id,
          int_Product_Id: product.id,
          txt_Product_Name: product.name,
          txt_SKU: product.sku,
          int_Quantity_On_Hand: product.stock,
          int_Reorder_Level: product.reorderLevel,
          category_name: product.category,
          txt_Store_Name: product.store,
          int_Store_Id: 1,
          bit_IsActive: 1,
        });
      }
      return null;
    }
    return inventoryRepository.toDTO(inv);
  }

  async adjustStock(
    {
      productId,
      storeId = 'store-01',
      quantity,
      type = 'ADJUSTMENT',
      reason = 'Manual stock adjustment',
      referenceId = null,
    },
    user = null
  ) {
    const qtyChange = Number(quantity);
    if (isNaN(qtyChange)) {
      throw new Error('Valid numeric quantity is required for stock adjustment.');
    }

    const product = await productRepository.findProductById(productId);
    if (!product) {
      throw new Error(`Product '${productId}' not found.`);
    }

    const storeIdNum = parseInt(String(storeId).replace(/\D/g, ''), 10) || 1;
    const previousStock = product.stock || 0;
    const newStock = Math.max(0, previousStock + qtyChange);

    return await withTransaction(async (conn) => {
      // 1. Update Inventory row
      const inventory = await inventoryRepository.upsertStock(
        product.id,
        storeIdNum,
        newStock,
        user?.name || 'system',
        conn
      );

      // 2. Log immutable StockTransaction
      const transaction = await stockTransactionRepository.createTransaction(
        {
          productId: product.id,
          storeId: storeIdNum,
          type,
          quantity: qtyChange,
          referenceNumber: referenceId || `ADJ-${Date.now().toString().slice(-4)}`,
          referenceType: 'ADJUSTMENT',
          referenceId: null,
          unitCost: product.costPrice || 0,
          performedByUserId: user?.userId || (user?.id ? parseInt(user.id, 10) || 1 : 1),
          remarks: reason,
          user: user?.name || 'system',
        },
        conn
      );

      // 3. Record Inventory Adjustment
      await inventoryAdjustmentRepository.createAdjustment(
        {
          storeId: storeIdNum,
          warehouseId: 1,
          productId: product.id,
          type,
          reason,
          quantityBefore: previousStock,
          quantityAdjusted: qtyChange,
          quantityAfter: newStock,
          costImpact: Math.abs(qtyChange * (product.costPrice || 0)),
          approvedByUserId: user?.userId || 1,
          user: user?.name || 'system',
        },
        conn
      );

      const updatedProduct = await productRepository.findProductById(product.id, conn);
      return {
        product: updatedProduct,
        inventory: inventoryRepository.toDTO(inventory),
        transaction: stockTransactionRepository.toDTO(transaction),
      };
    });
  }

  async getStockTransactions(filters = {}) {
    return await stockTransactionRepository.findAllTransactions(filters);
  }
}

module.exports = new InventoryService();
