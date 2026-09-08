const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Customer = require('../models/Customer');
const User = require('../models/User');

class DataQualityService {
  /**
   * Run comprehensive transactional data integrity and reconciliation audit
   */
  async runAudit() {
    const issues = [];
    const warnings = [];

    // 1. Check for negative stock levels
    const negativeStockProducts = await Product.find({ stock: { $lt: 0 } });
    if (negativeStockProducts.length > 0) {
      issues.push({
        type: 'NEGATIVE_STOCK_PRODUCT',
        severity: 'HIGH',
        count: negativeStockProducts.length,
        details: negativeStockProducts.map((p) => ({ id: p.productId, sku: p.sku, stock: p.stock })),
      });
    }

    const negativeStockInventory = await Inventory.find({ currentStock: { $lt: 0 } });
    if (negativeStockInventory.length > 0) {
      issues.push({
        type: 'NEGATIVE_STOCK_INVENTORY',
        severity: 'HIGH',
        count: negativeStockInventory.length,
        details: negativeStockInventory.map((i) => ({ id: i.inventoryId, sku: i.sku, stock: i.currentStock })),
      });
    }

    // 2. Check for Orders without valid items or zero quantities
    const invalidItemOrders = await Order.find({
      $or: [{ items: { $size: 0 } }, { 'items.qty': { $lte: 0 } }],
    });
    if (invalidItemOrders.length > 0) {
      issues.push({
        type: 'INVALID_ORDER_ITEMS',
        severity: 'HIGH',
        count: invalidItemOrders.length,
        details: invalidItemOrders.map((o) => o.orderId),
      });
    }

    // 3. Reconcile Completed Orders with Payments
    const completedOrders = await Order.find({ status: { $in: ['Completed', 'Delivered'] } });
    const completedPayments = await Payment.find({ status: 'Completed' });

    const paymentOrderIds = new Set(completedPayments.map((p) => p.orderId));
    const ordersWithoutPayment = completedOrders.filter((o) => !paymentOrderIds.has(o.orderId));

    if (ordersWithoutPayment.length > 0) {
      warnings.push({
        type: 'ORDER_WITHOUT_PAYMENT_RECORD',
        severity: 'MEDIUM',
        count: ordersWithoutPayment.length,
        description: 'Completed orders without matching payment records in payments collection.',
        details: ordersWithoutPayment.map((o) => ({ orderId: o.orderId, totalAmount: o.totalAmount })),
      });
    }

    const orderIdsSet = new Set(completedOrders.map((o) => o.orderId));
    const paymentsWithoutOrder = completedPayments.filter((p) => !orderIdsSet.has(p.orderId));

    if (paymentsWithoutOrder.length > 0) {
      warnings.push({
        type: 'PAYMENT_WITHOUT_ORDER_RECORD',
        severity: 'MEDIUM',
        count: paymentsWithoutOrder.length,
        description: 'Completed payment records without matching completed order records.',
        details: paymentsWithoutOrder.map((p) => ({ paymentId: p.paymentId, orderId: p.orderId })),
      });
    }

    // 4. Verify Product References in Orders
    const allProducts = await Product.find({}, { productId: 1 });
    const validProductIds = new Set(allProducts.map((p) => p.productId));

    let orphanedItemCount = 0;
    completedOrders.forEach((o) => {
      o.items.forEach((it) => {
        if (!validProductIds.has(it.productId)) {
          orphanedItemCount++;
        }
      });
    });

    if (orphanedItemCount > 0) {
      warnings.push({
        type: 'ORPHANED_ORDER_PRODUCT_REFERENCE',
        severity: 'LOW',
        count: orphanedItemCount,
        description: 'Order items referring to archived or deleted product SKUs.',
      });
    }

    const totalAuditedOrders = completedOrders.length;
    const totalAuditedPayments = completedPayments.length;
    const totalAuditedProducts = allProducts.length;

    const healthStatus = issues.length === 0 ? (warnings.length === 0 ? 'HEALTHY' : 'WARNING') : 'CRITICAL';

    return {
      status: healthStatus,
      timestamp: new Date().toISOString(),
      summary: {
        totalAuditedOrders,
        totalAuditedPayments,
        totalAuditedProducts,
        criticalIssueCount: issues.length,
        warningCount: warnings.length,
      },
      issues,
      warnings,
    };
  }
}

module.exports = new DataQualityService();
