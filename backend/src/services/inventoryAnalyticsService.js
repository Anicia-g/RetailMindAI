const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const { evaluateInventoryHealth, calculateDaysRemaining, calculateVelocities } = require('../utils/inventoryHealth');
const { parseDateRange } = require('../utils/dateUtils');

class InventoryAnalyticsService {
  /**
   * GET /api/analytics/inventory
   * Real-time stock status, health distributions, and capital exposure
   */
  async getInventorySummary(storeId = null) {
    const productMatch = { bit_IsActive: true };
    const inventoryMatch = { bit_IsActive: true };

    if (storeId && storeId !== 'All' && storeId !== 'all') {
      productMatch.$or = [{ storeId }, { store: new RegExp(storeId, 'i') }];
      inventoryMatch.$or = [{ storeId }, { store: new RegExp(storeId, 'i') }];
    }

    const [products, inventoryDocs] = await Promise.all([
      Product.find(productMatch),
      Inventory.find(inventoryMatch),
    ]);

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
        id: p.productId,
        productId: p.productId,
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
    const match = {
      bit_IsActive: true,
      status: { $in: ['Completed', 'Delivered'] },
      'items.productId': productId,
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (storeId && storeId !== 'All') {
      match.$or = [{ storeId }, { store: new RegExp(storeId, 'i') }];
    }

    const [agg] = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $match: { 'items.productId': productId } },
      {
        $group: {
          _id: null,
          totalUnitsSold: { $sum: '$items.qty' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const totalUnitsSold = agg?.totalUnitsSold || 0;
    const velocities = calculateVelocities(totalUnitsSold, days);

    return {
      productId,
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
    const query = { bit_IsActive: true };
    if (storeId && storeId !== 'All') {
      query.$or = [{ storeId }, { store: new RegExp(storeId, 'i') }];
    }

    const products = await Product.find(query);

    // Compute 30-day demand per product
    const { startDate, endDate } = parseDateRange('30d');
    const demandAgg = await Order.aggregate([
      {
        $match: {
          bit_IsActive: true,
          status: { $in: ['Completed', 'Delivered'] },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          unitsSold30d: { $sum: '$items.qty' },
        },
      },
    ]);

    const demandMap = new Map();
    demandAgg.forEach((d) => demandMap.set(d._id, d.unitsSold30d));

    return products.map((p) => {
      const units30d = demandMap.get(p.productId) || (p.unitsSold || 0);
      const velocities = calculateVelocities(units30d, 30);
      const daysRemaining = calculateDaysRemaining(p.stock, velocities.dailyVelocity || p.dailyVelocity || 1);

      return {
        productId: p.productId,
        productName: p.name,
        sku: p.sku,
        category: p.category,
        storeId: p.storeId || storeId || 'store-01',
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
    const query = { bit_IsActive: true };
    if (storeId && storeId !== 'All') {
      query.$or = [{ storeId }, { store: new RegExp(storeId, 'i') }];
    }

    const products = await Product.find(query);

    return products.map((p) => {
      const cost = Number(p.costPrice) || (p.price * 0.7);
      const profitMarginPct = p.price > 0 ? Number((((p.price - cost) / p.price) * 100).toFixed(1)) : 0;
      const velocity = Number(p.dailyVelocity) || 1.5;
      const daysToExpiry = p.expiryDays !== undefined && p.expiryDays !== null ? Number(p.expiryDays) : 45;

      return {
        productId: p.productId,
        productName: p.name,
        sku: p.sku,
        category: p.category,
        storeId: p.storeId || storeId || 'store-01',
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
