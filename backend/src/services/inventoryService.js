const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');

class InventoryService {
  async getAllInventory(filters = {}) {
    const query = { bit_IsActive: true };

    if (filters.search) {
      const q = filters.search.trim();
      query.$or = [
        { productName: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    if (filters.category && filters.category !== 'All') {
      query.category = filters.category;
    }

    if (filters.store && filters.store !== 'All') {
      query.$or = [
        { store: { $regex: filters.store, $options: 'i' } },
        { storeId: filters.store },
      ];
    }

    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }

    if (filters.riskLevel && filters.riskLevel !== 'All') {
      query.riskLevel = filters.riskLevel;
    }

    const items = await Inventory.find(query).sort({ currentStock: 1 });
    return items;
  }

  async getInventoryById(id) {
    return await Inventory.findOne({
      $or: [
        { inventoryId: id },
        { productId: id },
        { sku: id },
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      ],
      bit_IsActive: true,
    });
  }

  async adjustStock({ productId, storeId = 'store-01', quantity, type = 'ADJUSTMENT', reason = 'Manual stock adjustment', referenceId = null }, user = null) {
    const qtyChange = Number(quantity);
    if (isNaN(qtyChange)) {
      throw new Error('Valid numeric quantity is required for stock adjustment.');
    }

    const product = await Product.findOne({
      $or: [{ productId }, { sku: productId }, { _id: productId.match(/^[0-9a-fA-F]{24}$/) ? productId : null }],
    });

    if (!product) {
      throw new Error(`Product '${productId}' not found.`);
    }

    const previousStock = product.stock || 0;
    const newStock = Math.max(0, previousStock + qtyChange);

    // Update Product
    product.stock = newStock;
    product.stockStatus = newStock <= (product.reorderLevel / 2)
      ? 'Critical'
      : newStock <= product.reorderLevel
      ? 'Low Stock'
      : 'Healthy';
    product.expectedStockoutDays = product.dailyVelocity > 0
      ? Number((newStock / product.dailyVelocity).toFixed(1))
      : 30;
    product.txt_Modified_By = user?.name || 'system';
    product.dte_Modified_Date = new Date();
    await product.save();

    // Update Inventory
    let inventory = await Inventory.findOne({ productId: product.productId });
    if (!inventory) {
      inventory = new Inventory({
        inventoryId: `inv-${product.productId}`,
        productId: product.productId,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        image: product.image,
        store: product.store,
        storeId: product.storeId,
        minStock: product.reorderLevel,
      });
    }

    inventory.currentStock = newStock;
    inventory.status = product.stockStatus;
    inventory.riskLevel = newStock <= product.reorderLevel ? (newStock <= product.reorderLevel / 2 ? 'Critical' : 'High') : 'Low';
    inventory.daysRemaining = product.expectedStockoutDays;
    inventory.lastRestocked = new Date().toISOString().split('T')[0];
    inventory.txt_Modified_By = user?.name || 'system';
    inventory.dte_Modified_Date = new Date();
    await inventory.save();

    // Create immutable StockTransaction
    const transaction = await StockTransaction.create({
      transactionId: `stx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: product.productId,
      sku: product.sku,
      storeId: storeId || product.storeId,
      type,
      quantity: qtyChange,
      previousStock,
      newStock,
      referenceId,
      performedBy: user?.name || 'system',
      reason,
    });

    return {
      product,
      inventory,
      transaction,
    };
  }

  async getStockTransactions(filters = {}) {
    const query = {};
    if (filters.productId) query.productId = filters.productId;
    if (filters.type) query.type = filters.type;
    if (filters.storeId) query.storeId = filters.storeId;

    return await StockTransaction.find(query).sort({ timestamp: -1 }).limit(100);
  }
}

module.exports = new InventoryService();
