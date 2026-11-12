const db = require('../config/db');
const productRepository = require('../repositories/productRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const { evaluateInventoryHealth, calculateDaysRemaining, calculateVelocities } = require('../utils/inventoryHealth');
const { parseDateRange } = require('../utils/dateUtils');

class InventoryAnalyticsService {
  /**
   * GET /api/analytics/inventory
   * Real-time stock status, health distributions, and capital exposure
   */
  async getInventorySummary(storeId = null) {
    const products = await productRepository.getAll({ bit_IsActive: true });

    let totalInventoryUnits = 0;
    let totalInventoryValue = 0;

    let healthyCount = 0;
    let lowStockCount = 0;
    let criticalStockCount = 0;
    let outOfStockCount = 0;
    let overstockCount = 0;
    let expiringSoonCount = 0;

    const evaluatedProducts = products.map((p) => {
      const stock = Number(p.stock) || 0;
      const cost = Number(p.costPrice) || (p.price * 0.7);
      const value = Math.round(stock * cost);

      totalInventoryUnits += stock;
      totalInventoryValue += value;

      const health = evaluateInventoryHealth({
        currentStock: stock,
        reorderLevel: p.reorderLevel,
        dailyVelocity: p.dailyVelocity,
        expiryDays: p.expiryDays,
      });

      if (health.status === 'Out of Stock') outOfStockCount++;
      else if (health.status === 'Critical') criticalStockCount++;
      else if (health.status === 'Low Stock') lowStockCount++;
      else if (health.status === 'Overstock') overstockCount++;
      else healthyCount++;

      if (p.expiryDays && p.expiryDays <= 6 && stock > 0) {
        expiringSoonCount++;
      }

      return {
        id: String(p.productId),
        productId: String(p.productId),
        name: p.name,
        sku: p.sku,
        category: p.category,
        brand: p.brand,
        price: p.price,
        costPrice: p.costPrice,
        stock,
        reorderLevel: p.reorderLevel,
        inventoryValue: value,
        dailyVelocity: p.dailyVelocity,
        daysRemaining: health.daysRemaining,
        riskLevel: health.riskLevel,
        status: health.status,
        image: p.image,
      };
    });

    const lowStockProducts = evaluatedProducts.filter(
      (p) => p.status === 'Low Stock' || p.status === 'Critical' || p.status === 'Out of Stock'
    );
    const criticalStockProducts = evaluatedProducts.filter(
      (p) => p.status === 'Critical' || p.status === 'Out of Stock'
    );

    return {
      storeId: storeId || 'All',
      totalProducts: products.length,
      totalInventoryUnits,
      inventoryValue: totalInventoryValue,
      healthyCount,
      lowStockCount,
      criticalStockCount,
      outOfStockCount,
      overstockCount,
      expiringSoonCount,
      distribution: {
        healthy: healthyCount,
        lowStock: lowStockCount,
        critical: criticalStockCount,
        outOfStock: outOfStockCount,
        overstock: overstockCount,
      },
      lowStockProducts: lowStockProducts.slice(0, 10),
      criticalStockProducts: criticalStockProducts.slice(0, 5),
      products: evaluatedProducts,
    };
  }

  /**
   * Calculate precise sales velocity for a product over a given time window
   */
  async getStockVelocity(productId, storeId = null, days = 30) {
    const { startDate, endDate } = parseDateRange(`${days}d`);

    let conditions = "o.bit_IsActive = 1 AND UPPER(o.txt_Order_Status) IN ('COMPLETED', 'DELIVERED') AND oi.int_Product_Id = ? AND oi.bit_IsActive = 1";
    const params = [productId];

    if (startDate && endDate) {
      conditions += " AND o.dte_Created_Date >= ? AND o.dte_Created_Date <= ?";
      params.push(startDate, endDate);
    }
    if (storeId && storeId !== 'All') {
      conditions += " AND o.int_Store_Id = ?";
      params.push(storeId);
    }

    const sql = `
      SELECT 
        COALESCE(SUM(oi.int_Quantity), 0) AS totalUnitsSold,
        COUNT(DISTINCT o.int_Order_Id) AS orderCount
      FROM tbl_Order_Item oi
      JOIN tbl_Order o ON oi.int_Order_Id = o.int_Order_Id
      WHERE ${conditions}
    `;

    const [agg] = await db.query(sql, params);
    const totalUnitsSold = Number(agg?.totalUnitsSold) || 0;
    const velocities = calculateVelocities(totalUnitsSold, days);

    return {
      productId: String(productId),
      storeId: storeId || 'All',
      daysChecked: days,
      totalUnitsSold,
      ...velocities,
    };
  }

  /**
   * GET /api/analytics/inventory/risk-features
   * Clean feature matrix for future ML inventory risk models
   */
  async getInventoryRiskFeatures(storeId = null) {
    const products = await productRepository.getAll({ bit_IsActive: true });

    // Compute 30-day demand per product
    const { startDate, endDate } = parseDateRange('30d');
    const params = [];
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = ' AND o.dte_Created_Date >= ? AND o.dte_Created_Date <= ?';
      params.push(startDate, endDate);
    }

    const demandSql = `
      SELECT 
        oi.int_Product_Id AS productId,
        COALESCE(SUM(oi.int_Quantity), 0) AS unitsSold30d
      FROM tbl_Order_Item oi
      JOIN tbl_Order o ON oi.int_Order_Id = o.int_Order_Id
      WHERE o.bit_IsActive = 1 
        AND UPPER(o.txt_Order_Status) IN ('COMPLETED', 'DELIVERED')
        AND oi.bit_IsActive = 1
        ${dateFilter}
      GROUP BY oi.int_Product_Id
    `;

    const demandAgg = await db.query(demandSql, params);
    const demandMap = new Map();
    demandAgg.forEach((d) => demandMap.set(String(d.productId), Number(d.unitsSold30d) || 0));

    return products.map((p) => {
      const pIdStr = String(p.productId);
      const units30d = demandMap.get(pIdStr) || (p.unitsSold || 0);
      const velocities = calculateVelocities(units30d, 30);
      const daysRemaining = calculateDaysRemaining(p.stock, velocities.dailyVelocity || p.dailyVelocity || 1);

      return {
        productId: pIdStr,
        productName: p.name,
        sku: p.sku,
        category: p.category,
        storeId: String(p.storeId || storeId || '1'),
        currentStock: p.stock,
        reorderLevel: p.reorderLevel,
        dailySalesVelocity: velocities.dailyVelocity,
        weeklySalesVelocity: velocities.weeklyVelocity,
        monthlySalesVelocity: velocities.monthlyVelocity,
        daysRemaining,
        recentDemand30d: units30d,
        expiryDays: p.expiryDays || 30,
        unitCost: p.costPrice || (p.price * 0.7),
        unitPrice: p.price,
      };
    });
  }

  /**
   * GET /api/analytics/products/discount-features
   * Clean feature matrix for future ID3 / C4.5 Decision Tree models
   */
  async getDiscountFeatures(storeId = null) {
    const products = await productRepository.getAll({ bit_IsActive: true });

    return products.map((p) => {
      const cost = Number(p.costPrice) || (p.price * 0.7);
      const profitMarginPct = p.price > 0 ? Number((((p.price - cost) / p.price) * 100).toFixed(1)) : 0;
      const velocity = Number(p.dailyVelocity) || 1.5;
      const daysToExpiry = p.expiryDays !== undefined && p.expiryDays !== null ? Number(p.expiryDays) : 45;

      return {
        productId: String(p.productId),
        productName: p.name,
        sku: p.sku,
        category: p.category,
        storeId: String(p.storeId || storeId || '1'),
        currentStock: p.stock,
        reorderLevel: p.reorderLevel,
        salesVelocity: velocity,
        daysToExpiry,
        profitMarginPct,
        currentDiscountPct: p.discountPct || 0,
        sellingPrice: p.price,
        costPrice: cost,
        revenue: p.revenue || (p.price * (p.unitsSold || 0)),
        unitsSold: p.unitsSold || 0,
        season: 'Monsoon-Q3',
      };
    });
  }
}

module.exports = new InventoryAnalyticsService();

