const db = require('../config/db');

class DataQualityService {
  /**
   * Run comprehensive transactional data integrity and reconciliation audit
   */
  async runAudit() {
    const issues = [];
    const warnings = [];

    // 1. Check for negative stock levels
    const negativeStockInventory = await db.query(
      'SELECT int_Inventory_Id AS id, int_Product_Id AS productId, int_Quantity_Available AS stock FROM tbl_Inventory WHERE int_Quantity_Available < 0'
    );
    if (negativeStockInventory.length > 0) {
      issues.push({
        type: 'NEGATIVE_STOCK_INVENTORY',
        severity: 'HIGH',
        count: negativeStockInventory.length,
        details: negativeStockInventory.map((i) => ({ id: String(i.id), productId: String(i.productId), stock: Number(i.stock) })),
      });
    }

    // 2. Check for Orders without valid items or zero quantities
    const invalidItemOrders = await db.query(`
      SELECT o.int_Order_Id AS orderId, COUNT(oi.int_Order_Item_Id) AS itemCount, COALESCE(MIN(oi.int_Quantity), 0) AS minQty
      FROM tbl_Order o
      LEFT JOIN tbl_Order_Item oi ON o.int_Order_Id = oi.int_Order_Id AND oi.bit_IsActive = 1
      WHERE o.bit_IsActive = 1
      GROUP BY o.int_Order_Id
      HAVING itemCount = 0 OR minQty <= 0
    `);
    if (invalidItemOrders.length > 0) {
      issues.push({
        type: 'INVALID_ORDER_ITEMS',
        severity: 'HIGH',
        count: invalidItemOrders.length,
        details: invalidItemOrders.map((o) => String(o.orderId)),
      });
    }

    // 3. Reconcile Completed Orders with Payments
    const completedOrders = await db.query(
      "SELECT int_Order_Id AS orderId, dec_Total_Amount AS totalAmount FROM tbl_Order WHERE bit_IsActive = 1 AND txt_Order_Status IN ('COMPLETED', 'DELIVERED')"
    );
    const completedPayments = await db.query(
      "SELECT int_Payment_Id AS paymentId, int_Source_Id AS orderId FROM tbl_Payment WHERE bit_IsActive = 1 AND txt_Payment_Status = 'COMPLETED' AND txt_Payment_Source_Type = 'ORDER'"
    );

    const paymentOrderIds = new Set(completedPayments.map((p) => String(p.orderId)));
    const ordersWithoutPayment = completedOrders.filter((o) => !paymentOrderIds.has(String(o.orderId)));

    if (ordersWithoutPayment.length > 0) {
      warnings.push({
        type: 'ORDER_WITHOUT_PAYMENT_RECORD',
        severity: 'MEDIUM',
        count: ordersWithoutPayment.length,
        description: 'Completed orders without matching payment records in payments table.',
        details: ordersWithoutPayment.map((o) => ({ orderId: String(o.orderId), totalAmount: Number(o.totalAmount) })),
      });
    }

    const orderIdsSet = new Set(completedOrders.map((o) => String(o.orderId)));
    const paymentsWithoutOrder = completedPayments.filter((p) => !orderIdsSet.has(String(p.orderId)));

    if (paymentsWithoutOrder.length > 0) {
      warnings.push({
        type: 'PAYMENT_WITHOUT_ORDER_RECORD',
        severity: 'MEDIUM',
        count: paymentsWithoutOrder.length,
        description: 'Completed payment records without matching completed order records.',
        details: paymentsWithoutOrder.map((p) => ({ paymentId: String(p.paymentId), orderId: String(p.orderId) })),
      });
    }

    // 4. Verify Product References in Orders
    const orphanedItems = await db.query(`
      SELECT oi.int_Order_Item_Id AS itemId, oi.int_Product_Id AS productId
      FROM tbl_Order_Item oi
      LEFT JOIN tbl_Product p ON oi.int_Product_Id = p.int_Product_Id
      WHERE oi.bit_IsActive = 1 AND p.int_Product_Id IS NULL
    `);

    if (orphanedItems.length > 0) {
      warnings.push({
        type: 'ORPHANED_ORDER_PRODUCT_REFERENCE',
        severity: 'LOW',
        count: orphanedItems.length,
        description: 'Order items referring to archived or non-existent product IDs.',
      });
    }

    const totalAuditedOrders = completedOrders.length;
    const totalAuditedPayments = completedPayments.length;
    const totalAuditedProducts = (await db.query('SELECT COUNT(*) AS cnt FROM tbl_Product WHERE bit_IsActive = 1'))[0]?.cnt || 0;

    const healthStatus = issues.length === 0 ? (warnings.length === 0 ? 'HEALTHY' : 'WARNING') : 'CRITICAL';

    return {
      status: healthStatus,
      timestamp: new Date().toISOString(),
      summary: {
        totalAuditedOrders,
        totalAuditedPayments,
        totalAuditedProducts: Number(totalAuditedProducts),
        criticalIssueCount: issues.length,
        warningCount: warnings.length,
      },
      issues,
      warnings,
    };
  }
}

module.exports = new DataQualityService();

