const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const StockTransaction = require('../models/StockTransaction');

class PurchaseOrderService {
  async getAllPurchaseOrders(filters = {}) {
    const query = { bit_IsActive: true };

    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }

    if (filters.supplierId) {
      query.supplierId = filters.supplierId;
    }

    return await PurchaseOrder.find(query).sort({ createdAt: -1 });
  }

  async getPurchaseOrderById(id) {
    return await PurchaseOrder.findOne({
      $or: [{ poId: id }, { poNumber: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      bit_IsActive: true,
    });
  }

  async createPurchaseOrder(data, user = null) {
    const poNumber = data.poNumber || `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const poId = data.poId || `PO-${Date.now().toString().slice(-4)}`;

    const totalCost = (data.items || []).reduce(
      (acc, item) => acc + (Number(item.total) || (Number(item.quantity) * Number(item.unitCost)) || 0),
      0
    );

    const po = await PurchaseOrder.create({
      ...data,
      poId,
      poNumber,
      totalCost: data.totalCost || totalCost,
      createdBy: user?.name || 'Admin User',
      txt_Created_By: user?.name || 'system',
    });

    return po;
  }

  async updatePurchaseOrderStatus(id, status, user = null) {
    const po = await PurchaseOrder.findOne({
      $or: [{ poId: id }, { poNumber: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!po) {
      throw new Error(`Purchase order '${id}' not found.`);
    }

    const prevStatus = po.status;
    po.status = status;
    po.txt_Modified_By = user?.name || 'system';
    po.dte_Modified_Date = new Date();
    await po.save();

    // If marked Delivered and was not previously delivered, automatically replenish stock!
    if (status === 'Delivered' && prevStatus !== 'Delivered') {
      for (const item of po.items) {
        const product = await Product.findOne({
          $or: [{ sku: item.sku }, { name: item.name }],
        });

        if (product) {
          const previousStock = product.stock;
          const newStock = previousStock + item.quantity;
          product.stock = newStock;
          product.stockStatus = newStock <= product.reorderLevel ? 'Low Stock' : 'Healthy';
          await product.save();

          await Inventory.findOneAndUpdate(
            { productId: product.productId },
            {
              currentStock: newStock,
              status: product.stockStatus,
              lastRestocked: new Date().toISOString().split('T')[0],
            }
          );

          await StockTransaction.create({
            transactionId: `stx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            productId: product.productId,
            sku: product.sku,
            storeId: po.storeId || 'store-01',
            type: 'PURCHASE',
            quantity: item.quantity,
            previousStock,
            newStock,
            referenceId: po.poNumber,
            performedBy: user?.name || 'Procurement System',
            reason: `PO #${po.poNumber} Delivery Restock`,
          });
        }
      }
    }

    return po;
  }
}

module.exports = new PurchaseOrderService();
